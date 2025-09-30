import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreateNpcModal } from '../components/CreateNpcModal';
import { getUserNpcs, NpcData } from '../services/api';

export function NpcsPage() {
  const [npcs, setNpcs] = useState<NpcData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [expandedNpc, setExpandedNpc] = useState<string | null>(null);

  const fetchNpcs = useCallback(async () => {
    try {
      setError(null);
      const data = await getUserNpcs();
      setNpcs(data);
    } catch (error) {
      console.error('Erro ao buscar NPCs:', error);
      setError('Erro ao carregar NPCs. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNpcs();
  }, [fetchNpcs]);

  const handleNpcCreated = () => {
    fetchNpcs();
    setModalOpen(false);
  };

  const toggleExpanded = (npcId: string) => {
    setExpandedNpc(expandedNpc === npcId ? null : npcId);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Comerciante': return '💰';
      case 'Ferreiro': return '⚒️';
      case 'Guarda': return '🛡️';
      case 'Nobre': return '👑';
      case 'Sacerdote': return '⛪';
      case 'Tavarneiro': return '🍺';
      case 'Mago': return '🔮';
      case 'Ladrão': return '🗡️';
      case 'Vilão': return '💀';
      case 'Mentor': return '📚';
      case 'Informante': return '👁️';
      default: return '🎭';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-title text-primary text-xl">Carregando habitantes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateNpcModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onNpcCreated={handleNpcCreated} 
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-title text-5xl font-bold text-primary">Meus NPCs</h2>
            <p className="text-text-muted mt-2">Gerencie os personagens não-jogáveis do seu mundo</p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-background font-bold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            + Criar NPC
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
            {error}
            <button 
              onClick={fetchNpcs}
              className="ml-4 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* NPCs List */}
        <div className="bg-surface/70 rounded-lg border border-secondary/30 overflow-hidden">
          {npcs.length > 0 ? (
            <div className="divide-y divide-secondary/20">
              {npcs.map((npc) => (
                <div key={npc.id} className="p-6 hover:bg-background/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <Link 
                      to={`/tools/npcs/${npc.id}`}
                      className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getRoleIcon(npc.role || '')}</span>
                        <h3 className="font-bold text-xl text-text-base hover:text-primary transition-colors">{npc.name}</h3>
                        {npc.role && (
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
                            {npc.role}
                          </span>
                        )}
                      </div>
                      
                      {npc.location && (
                        <p className="text-text-muted mb-2">
                          📍 {npc.location}
                        </p>
                      )}
                      
                      {npc.description && (
                        <p className="text-text-base text-sm line-clamp-2">
                          {npc.description}
                        </p>
                      )}
                    </Link>
                    
                    <button 
                      className="text-text-muted hover:text-text-base transition-colors ml-4"
                      onClick={() => toggleExpanded(npc.id)}
                    >
                      {expandedNpc === npc.id ? '▼' : '▶'}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedNpc === npc.id && (
                    <div className="mt-4 pt-4 border-t border-secondary/20 space-y-3">
                      {npc.description && (
                        <div>
                          <h4 className="font-semibold text-text-base mb-2">Descrição:</h4>
                          <p className="text-text-muted whitespace-pre-wrap">{npc.description}</p>
                        </div>
                      )}
                      
                      {npc.notes && (
                        <div>
                          <h4 className="font-semibold text-text-base mb-2 flex items-center gap-2">
                            🔒 Notas Secretas (Mestre):
                          </h4>
                          <div className="bg-background/50 p-3 rounded border border-secondary/30">
                            <p className="text-text-muted whitespace-pre-wrap">{npc.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-4 text-sm text-text-muted">
                        <span>ID: {npc.id}</span>
                        <span>•</span>
                        <span>Criado por você</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏰</div>
              <h3 className="font-title text-xl text-text-base mb-2">Seu reino está desabitado</h3>
              <p className="text-text-muted mb-6">Crie seu primeiro NPC para povoar seu mundo de aventuras!</p>
              <button 
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-background font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Criar Primeiro NPC
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {npcs.length > 0 && (
          <div className="bg-surface/50 rounded-lg p-4 border border-secondary/20">
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Total de NPCs: {npcs.length}</span>
              <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}