import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreateMonsterModal } from '../components/CreateMonsterModal';
import { getUserMonsters, MonsterData } from '../services/api';

export function MonstersPage() {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonsters = useCallback(async () => {
    try {
      setError(null);
      const data = await getUserMonsters();
      setMonsters(data);
    } catch (error) {
      console.error("Erro ao buscar monstros:", error);
      setError("Erro ao carregar o bestiário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  const handleMonsterCreated = () => {
    fetchMonsters();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-title text-primary text-xl">Consultando o bestiário...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateMonsterModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onMonsterCreated={handleMonsterCreated} 
      />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-title text-4xl sm:text-5xl font-bold text-primary">
            Meu Bestiário
          </h2>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-background font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span>
            Conjurar Criatura
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
            {error}
            <button 
              onClick={fetchMonsters}
              className="ml-4 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Monsters List */}
        <div className="bg-surface/70 backdrop-blur-sm p-6 rounded-lg border border-secondary/30 shadow-lg">
          {monsters.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-text-muted">
                {monsters.length} criatura{monsters.length !== 1 ? 's' : ''} no bestiário
              </div>
              <div className="grid gap-4">
                {monsters.map(monster => (
                  <Link 
                    key={monster.id}
                    to={`/tools/monsters/${monster.id}`}
                    className="block p-4 bg-background/50 rounded-lg border border-secondary/20 hover:border-primary/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-text-base group-hover:text-primary transition-colors">
                          {monster.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary/60 rounded-full"></span>
                            {monster.size} {monster.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-secondary/60 rounded-full"></span>
                            ND {monster.challenge_rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-accent/60 rounded-full"></span>
                            CA {monster.armor_class}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 text-sm">
                        <div className="bg-background/70 px-3 py-1 rounded border border-secondary/20">
                          <span className="text-text-muted">PV:</span>
                          <span className="text-text-base ml-1">{monster.hit_points}</span>
                        </div>
                        <div className="bg-background/70 px-3 py-1 rounded border border-secondary/20">
                          <span className="text-text-muted">Velocidade:</span>
                          <span className="text-text-base ml-1">{monster.speed}</span>
                        </div>
                      </div>
                    </div>
                    
                    {monster.actions && (
                      <div className="mt-3 pt-3 border-t border-secondary/20">
                        <h4 className="text-sm font-medium text-text-base mb-1">Ações:</h4>
                        <p className="text-sm text-text-muted leading-relaxed">
                          {monster.actions.length > 150 
                            ? `${monster.actions.substring(0, 150)}...` 
                            : monster.actions
                          }
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/icons/Monstros & Criaturas.png" alt="Dragão" className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-title text-xl text-text-base mb-2">
                Seu bestiário está vazio
              </h3>
              <p className="text-text-muted mb-6">
                Conjure sua primeira criatura para começar a povoar seu mundo!
              </p>
              <button 
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-background font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Conjurar Primeira Criatura
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}