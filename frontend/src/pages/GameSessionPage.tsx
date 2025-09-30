import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { getTableById, TableData, TokenState, uploadMap, getUserCharacters, getUserMonsters, getUserNpcs, CharacterData, MonsterData, NpcData } from '../services/api';
import { TacticalMap } from '../components/TacticalMap';
import { AudioSettings } from '../components/AudioSettings';
import VisualEffects, { useVisualEffects, EffectType } from '../components/VisualEffects';
import { useAudio, SoundType } from '../services/audioManager';
import toast from 'react-hot-toast';

export function GameSessionPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const { user, token } = useAuthContext();
  
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [npcs, setNpcs] = useState<NpcData[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const websocket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sistema de áudio
  const { playSound, setAmbient, playUI, playDiceRoll } = useAudio();
  
  // Sistema de efeitos visuais
  const {
    effects,
    removeEffect,
    showDamage,
    showHealing,
    showCritical,
    showSpellCast,
    showDiceRoll,
    showSuccess,
    showNotification
  } = useVisualEffects();

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Busca os dados iniciais da mesa (mapa, tokens)
  useEffect(() => {
    if (tableId) {
      getTableById(tableId).then(setTableData).catch(console.error);
    }
  }, [tableId]);

  // Verifica se o usuário é o mestre da mesa
  const isMaster = tableData && user && tableData.master_id === user.id;

  // Busca os assets do mestre (personagens, monstros, NPCs)
  useEffect(() => {
    if (isMaster && user) {
      setIsLoadingAssets(true);
      Promise.all([
        getUserCharacters(),
        getUserMonsters(),
        getUserNpcs()
      ])
      .then(([charactersData, monstersData, npcsData]) => {
        setCharacters(charactersData);
        setMonsters(monstersData);
        setNpcs(npcsData);
      })
      .catch(error => {
        console.error('Erro ao carregar assets:', error);
        toast.error('Erro ao carregar personagens e monstros.');
      })
      .finally(() => setIsLoadingAssets(false));
    }
  }, [isMaster, user]);
  
  // Gerencia a conexão WebSocket e áudio
  useEffect(() => {
    if (!user || !tableId) return;

    // Verificar se há token de autenticação
    if (!token) {
      console.error('Token de autenticação não encontrado');
      toast.error('Erro de autenticação. Faça login novamente.');
      return;
    }

    // Inicia som ambiente de taverna por padrão
    setAmbient(SoundType.TAVERN_AMBIENT);

    // Conecta ao endpoint WebSocket com autenticação via query parameter
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${tableId}/${user.username}?token=${encodeURIComponent(token)}`);
    websocket.current = ws;

    ws.onopen = () => {
      console.log('WebSocket Conectado!');
        setMessages(prev => [...prev, '🟢 Conectado ao chat da mesa...']);
        playUI('success'); // Som de conexão
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, `${data.sender}: ${data.message}`]);
        playUI('notification'); // Som de nova mensagem
        // Efeito visual de notificação
        showNotification(window.innerWidth - 200, 100, 'Nova mensagem');
      } else if (data.type === 'tokens_updated') {
        // Atualiza o estado dos tokens, o que fará o mapa se redesenhar
        setTableData(prev => prev ? { ...prev, tokens_state: data.state } : null);
        playSound(SoundType.TOKEN_MOVE); // Som de movimento de token
        // Efeito visual de movimento
        showSuccess(window.innerWidth / 2, window.innerHeight / 2, 'Token movido');
      } else if (data.type === 'map_updated') {
        // Recarrega os dados da mesa quando o mapa é atualizado
        if (tableId) {
          getTableById(tableId).then(setTableData).catch(console.error);
          setMessages(prev => [...prev, 'Mapa atualizado pelo Mestre!']);
          playSound(SoundType.SPELL_CAST); // Som de atualização de mapa
          // Efeito visual de magia para atualização de mapa
          showSpellCast(window.innerWidth / 2, 200, 'Mapa Atualizado');
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Desconectado!');
      setMessages(prev => [...prev, '🔴 Você foi desconectado.']);
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      setMessages(prev => [...prev, 'Erro na conexão.']);
      toast.error('Erro na conexão WebSocket');
    };

    // Função de limpeza: ESSENCIAL para fechar a conexão quando o usuário sai da página
    return () => {
      ws.close();
      setAmbient(null); // Para som ambiente ao sair
    };
  }, [tableId, user, token]); // Removidas funções que causam loops

  const handleSendMessage = () => {
    if (inputMessage.trim() && websocket.current?.readyState === WebSocket.OPEN) {
      const chatMessage = { type: 'chat', payload: inputMessage };
      websocket.current.send(JSON.stringify(chatMessage));
      setInputMessage('');
      playUI('click'); // Som de envio de mensagem
    }
  };

  // Função para enviar atualizações de tokens
  const handleTokensUpdate = (newTokensState: TokenState[]) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'update_tokens',
        payload: newTokensState
      };
      websocket.current.send(JSON.stringify(message));
      playSound(SoundType.TOKEN_MOVE); // Som de movimento de token
    }
  };

  // Função para adicionar um novo token ao mapa
  const handleAddTokenToMap = (asset: CharacterData | MonsterData | NpcData, type: 'character' | 'monster' | 'npc') => {
    if (!tableData) return;

    const newToken: TokenState = {
      id: `${type}_${asset.id}_${Date.now()}`,
      imageUrl: '', // Por enquanto sem imagem, apenas o label
      x: 0, // Posição inicial no grid
      y: 0,
      size: 1,
      label: asset.name
    };

    const updatedTokens = [...(tableData.tokens_state || []), newToken];
    setTableData(prev => prev ? { ...prev, tokens_state: updatedTokens } : null);
    handleTokensUpdate(updatedTokens);
    toast.success(`${asset.name} adicionado ao mapa!`);
    
    // Som e efeito visual baseado no tipo de token
      if (type === 'monster') {
        playSound(SoundType.SWORD_ATTACK);
        showDamage(window.innerWidth / 2, window.innerHeight / 2, 0);
      } else {
        playSound(SoundType.SPELL_CAST);
        showSpellCast(window.innerWidth / 2, window.innerHeight / 2, asset.name);
      }
  };

  // Função para lidar com drag start da biblioteca
  const handleDragStart = (e: React.DragEvent, asset: CharacterData | MonsterData | NpcData, type: 'character' | 'monster' | 'npc') => {
    e.dataTransfer.setData('application/json', JSON.stringify({ asset, type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para lidar com a seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Função para fazer upload do mapa
  const handleUploadMap = async () => {
    if (!selectedFile || !tableId) return;
    
    setIsUploading(true);
    try {
      await uploadMap(tableId, selectedFile);
      toast.success('Mapa enviado com sucesso!');
      setSelectedFile(null);
      // Reset do input file
      const fileInput = document.getElementById('map-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      playSound(SoundType.SPELL_CAST); // Som de upload de mapa
    } catch (error) {
      console.error('Erro ao enviar mapa:', error);
      toast.error('Erro ao enviar o mapa. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user || !tableId) {
    return (
      <div className="flex items-center justify-center h-[85vh]">
        <div className="text-center">
          <h2 className="font-title text-2xl text-primary mb-4">Erro de Acesso</h2>
          <p className="text-text-muted">Usuário não autenticado ou mesa não encontrada.</p>
        </div>
      </div>
    );
  }

  if (!tableData) return <div>Carregando sessão da mesa...</div>;

  return (
    <div className="flex gap-4 h-[90vh]">
      {/* Sistema de Efeitos Visuais */}
      <VisualEffects effects={effects} onEffectComplete={removeEffect} />
      
      {/* Coluna Principal com o Mapa */}
      <div className="flex-grow">
        <TacticalMap
          mapImageUrl={tableData.map_image_url}
          tokens={tableData.tokens_state}
          onTokensChange={handleTokensUpdate}
        />
      </div>

      {/* Coluna Lateral com Ferramentas e Chat */}
      <div className="w-1/4 flex flex-col bg-surface/70 rounded-lg p-4 border border-secondary/30 space-y-4">
        
        {/* Configurações de Áudio */}
        <div className="bg-background/50 rounded-lg p-3 border border-accent/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-title text-sm text-accent">🔊 Áudio</h3>
            <button
              onClick={() => setShowAudioSettings(!showAudioSettings)}
              className="text-xs bg-accent/20 hover:bg-accent/30 text-accent px-2 py-1 rounded transition-colors"
            >
              {showAudioSettings ? 'Ocultar' : 'Configurar'}
            </button>
          </div>
          <AudioSettings 
             isOpen={showAudioSettings} 
             onClose={() => setShowAudioSettings(false)} 
           />
        </div>

        {/* Ferramentas do Mestre */}
        {isMaster && (
          <div className="bg-background/50 rounded-lg p-3 border border-primary/30 space-y-4">
            <h3 className="font-title text-lg text-primary mb-3"><img src="/icons/Sistema de Dados.png" alt="Dados" style={{width: '20px', height: '20px', marginRight: '8px', display: 'inline'}} /> Ferramentas do Mestre</h3>
            
            {/* Upload de Mapa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-base">Trocar Mapa:</label>
              <input
                id="map-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-background hover:file:bg-primary/80"
              />
              {selectedFile && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted truncate">{selectedFile.name}</span>
                  <button
                    onClick={handleUploadMap}
                    disabled={isUploading}
                    className="bg-primary text-background font-bold py-1 px-3 rounded text-sm hover:bg-primary/80 disabled:opacity-50"
                  >
                    {isUploading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              )}
            </div>

            {/* Biblioteca de Tokens */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-base flex items-center gap-2">
                <img src="/icons/Personagem-Máscara.png" alt="Personagem" style={{width: '16px', height: '16px'}} /> Biblioteca de Tokens
                {isLoadingAssets && <span className="text-xs text-text-muted">(Carregando...)</span>}
              </h4>
              
              <div className="max-h-64 overflow-y-auto space-y-2 bg-background/30 rounded p-2">
                {/* Personagens */}
                {characters.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-accent mb-1">👥 Personagens</h5>
                    <div className="space-y-1">
                      {characters.map(character => (
                        <div
                          key={character.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, character, 'character')}
                          onClick={() => handleAddTokenToMap(character, 'character')}
                          className="flex items-center gap-2 p-2 bg-surface/50 rounded cursor-pointer hover:bg-surface/70 transition-colors border border-transparent hover:border-accent/30"
                        >
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                            {character.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-base truncate">{character.name}</p>
                            <p className="text-xs text-text-muted truncate">{character.character_class}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monstros */}
                {monsters.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-accent mb-1">👹 Monstros</h5>
                    <div className="space-y-1">
                      {monsters.map(monster => (
                        <div
                          key={monster.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, monster, 'monster')}
                          onClick={() => handleAddTokenToMap(monster, 'monster')}
                          className="flex items-center gap-2 p-2 bg-surface/50 rounded cursor-pointer hover:bg-surface/70 transition-colors border border-transparent hover:border-accent/30"
                        >
                          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-xs font-bold text-white">
                            {monster.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-base truncate">{monster.name}</p>
                            <p className="text-xs text-text-muted truncate">CR {monster.challenge_rating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NPCs */}
                {npcs.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-accent mb-1">🤝 NPCs</h5>
                    <div className="space-y-1">
                      {npcs.map(npc => (
                        <div
                          key={npc.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, npc, 'npc')}
                          onClick={() => handleAddTokenToMap(npc, 'npc')}
                          className="flex items-center gap-2 p-2 bg-surface/50 rounded cursor-pointer hover:bg-surface/70 transition-colors border border-transparent hover:border-accent/30"
                        >
                          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold text-white">
                            {npc.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-base truncate">{npc.name}</p>
                            <p className="text-xs text-text-muted truncate">{npc.character_class}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado vazio */}
                {!isLoadingAssets && characters.length === 0 && monsters.length === 0 && npcs.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-xs text-text-muted">Nenhum personagem ou monstro criado ainda.</p>
                    <p className="text-xs text-text-muted mt-1">Crie alguns na seção "Criações" para usar aqui!</p>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-text-muted italic">
                💡 Dica: Clique ou arraste um item para adicioná-lo ao mapa
              </p>
            </div>
          </div>
        )}
        
        {/* Chat da Mesa */}
        <div className="flex-grow flex flex-col">
          <h3 className="font-title text-xl text-primary mb-4">Chat da Mesa</h3>
        <div className="flex-grow bg-background/50 rounded p-2 overflow-y-auto mb-4 space-y-2">
            {messages.map((msg, index) => <p key={index} className="text-text-base text-sm">{msg}</p>)}
            <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} className="flex-grow p-2 rounded bg-background border border-gray-600" placeholder="Digite sua mensagem..."/>
            <button onClick={handleSendMessage} className="bg-primary text-background font-bold py-2 px-4 rounded-lg">Enviar</button>
        </div>
        
          {/* Connection Status */}
          <div className="mt-2 text-xs text-text-muted text-center">
            Status: {websocket.current?.readyState === WebSocket.OPEN ? '🟢 Conectado' : 
                    websocket.current?.readyState === WebSocket.CONNECTING ? '🟡 Conectando...' : 
                    '🔴 Desconectado'}
          </div>
        </div>
      </div>
    </div>
  );
}