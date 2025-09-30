import { useState, useCallback, useEffect } from 'react';
import type { TokenState } from '../services/api';

interface UseDragAndDropProps {
  tokens: TokenState[];
  onTokensChange?: (newTokensState: TokenState[]) => void;
  gridSize?: number;
}

interface DragHandlers {
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  currentTokens: TokenState[];
}

// Função de debounce simples
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function useDragAndDrop({ tokens, onTokensChange, gridSize = 50 }: UseDragAndDropProps): DragHandlers {
  // Estados de controle para arrastar tokens
  const [isDragging, setIsDragging] = useState(false);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentTokens, setCurrentTokens] = useState<TokenState[]>(tokens || []);

  // Função para obter coordenadas do mouse relativas ao canvas
  const getMousePos = useCallback((canvas: HTMLCanvasElement, e: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Função para verificar se o clique está dentro de um token
  const getTokenAtPosition = useCallback((x: number, y: number): TokenState | null => {
    // Percorre do último para o primeiro (tokens por cima)
    for (let i = currentTokens.length - 1; i >= 0; i--) {
      const token = currentTokens[i];
      const tokenCenterX = token.x * gridSize + gridSize / 2;
      const tokenCenterY = token.y * gridSize + gridSize / 2;
      const tokenRadius = (gridSize / 2) * 0.8;
      
      const distance = Math.sqrt(
        Math.pow(x - tokenCenterX, 2) + Math.pow(y - tokenCenterY, 2)
      );
      
      if (distance <= tokenRadius) {
        return token;
      }
    }
    return null;
  }, [currentTokens, gridSize]);

  // Função debounced para atualizar tokens via WebSocket
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTokensUpdate = useCallback(
    debounce((updatedTokens: TokenState[]) => {
      if (onTokensChange) {
        onTokensChange(updatedTokens);
      }
    }, 75), // 75ms de delay para otimizar performance
    [onTokensChange]
  );

  // Manipulador de início do arraste
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const mousePos = getMousePos(canvas, e);
    const clickedToken = getTokenAtPosition(mousePos.x, mousePos.y);
    
    if (clickedToken) {
      setIsDragging(true);
      setDraggingTokenId(clickedToken.id);
      
      // Calcula o offset do clique em relação ao centro do token
      const tokenCenterX = clickedToken.x * gridSize + gridSize / 2;
      const tokenCenterY = clickedToken.y * gridSize + gridSize / 2;
      setDragOffset({
        x: mousePos.x - tokenCenterX,
        y: mousePos.y - tokenCenterY
      });
    }
  }, [getMousePos, getTokenAtPosition, gridSize]);

  // Manipulador de movimento do mouse
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggingTokenId) return;
    
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const mousePos = getMousePos(canvas, e);
    
    // Atualiza a posição do token sendo arrastado
    const updatedTokens = currentTokens.map(token => {
      if (token.id === draggingTokenId) {
        // Calcula nova posição ajustada pelo offset
        const newCenterX = mousePos.x - dragOffset.x;
        const newCenterY = mousePos.y - dragOffset.y;
        
        // Converte para coordenadas do grid (mas ainda permite posição livre)
        const newGridX = (newCenterX - gridSize / 2) / gridSize;
        const newGridY = (newCenterY - gridSize / 2) / gridSize;
        
        return {
          ...token,
          x: Math.max(0, newGridX),
          y: Math.max(0, newGridY)
        };
      }
      return token;
    });
    
    setCurrentTokens(updatedTokens);
    
    // Chama a função debounced para otimizar as atualizações via WebSocket
    debouncedTokensUpdate(updatedTokens);
  }, [isDragging, draggingTokenId, getMousePos, dragOffset, currentTokens, gridSize, debouncedTokensUpdate]);

  // Manipulador de fim do arraste
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggingTokenId) return;
    
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const mousePos = getMousePos(canvas, e);
    
    // Calcula a posição final no grid (arredondada)
    const newCenterX = mousePos.x - dragOffset.x;
    const newCenterY = mousePos.y - dragOffset.y;
    const finalGridX = Math.round((newCenterX - gridSize / 2) / gridSize);
    const finalGridY = Math.round((newCenterY - gridSize / 2) / gridSize);
    
    // Atualiza o estado final dos tokens
    const updatedTokens = currentTokens.map(token => {
      if (token.id === draggingTokenId) {
        return {
          ...token,
          x: Math.max(0, finalGridX),
          y: Math.max(0, finalGridY)
        };
      }
      return token;
    });
    
    setCurrentTokens(updatedTokens);
    
    // Notifica a página principal sobre a mudança final (sem debounce)
    if (onTokensChange) {
      onTokensChange(updatedTokens);
    }
    
    // Reset dos estados de controle
    setIsDragging(false);
    setDraggingTokenId(null);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, draggingTokenId, getMousePos, dragOffset, currentTokens, gridSize, onTokensChange]);

  // Manipulador para quando o mouse sai do canvas
  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMouseUp(e);
  }, [handleMouseUp]);

  // Atualiza tokens locais quando as props mudam
  useEffect(() => {
    setCurrentTokens(tokens || []);
  }, [tokens]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    currentTokens
  };
}