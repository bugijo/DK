import React, { useRef, useEffect } from 'react';
import type { TokenState } from '../services/api';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

interface TacticalMapProps {
  mapImageUrl?: string | null;
  tokens?: TokenState[] | null;
  onTokensChange?: (newTokensState: TokenState[]) => void;
}

const GRID_SIZE = 50; // Tamanho de cada célula do grid em pixels

export function TacticalMap({ mapImageUrl, tokens = [], onTokensChange }: TacticalMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Hook customizado para lógica de arrastar e soltar
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    currentTokens
  } = useDragAndDrop({ tokens: tokens || [], onTokensChange, gridSize: GRID_SIZE });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lógica de Desenho
    const draw = () => {
      // 1. Desenha o grid (função simples por enquanto)
      ctx.strokeStyle = '#4A5568'; // Cor cinza para o grid
      for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // 2. Desenha os tokens
      currentTokens?.forEach(token => {
        ctx.fillStyle = 'red'; // Cor de fallback para o token
        ctx.beginPath();
        ctx.arc(token.x * GRID_SIZE + GRID_SIZE / 2, token.y * GRID_SIZE + GRID_SIZE / 2, (GRID_SIZE / 2) * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(token.label, token.x * GRID_SIZE + GRID_SIZE / 2, token.y * GRID_SIZE + GRID_SIZE / 2);
      });
    }

    // Carrega a imagem de fundo do mapa e depois desenha
    if (mapImageUrl) {
      const mapImage = new Image();
      mapImage.src = `http://localhost:8000${mapImageUrl}`; // Supondo que a URL é relativa
      mapImage.onload = () => {
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        draw();
      };
      mapImage.onerror = () => {
        draw(); // Desenha mesmo que a imagem falhe
      }
    } else {
      draw(); // Desenha sem imagem de fundo
    }

  }, [mapImageUrl, currentTokens]); // Redesenha sempre que o mapa ou os tokens mudarem



  // Função para lidar com drop de tokens da biblioteca
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { asset, type } = data;
      
      if (!asset || !type) return;
      
      // Calcula a posição no grid baseada na posição do mouse
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      
      // Cria o novo token
      const newToken: TokenState = {
        id: `${type}_${asset.id}_${Date.now()}`,
        imageUrl: '', // Por enquanto sem imagem, apenas o label
        x: gridX,
        y: gridY,
        size: 1,
        label: asset.name
      };
      
      // Adiciona o token à lista
      const updatedTokens = [...(tokens || []), newToken];
      onTokensChange?.(updatedTokens);
      
    } catch (error) {
      console.error('Erro ao processar drop:', error);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={800}
      className="bg-background border border-gray-700 cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  );
}