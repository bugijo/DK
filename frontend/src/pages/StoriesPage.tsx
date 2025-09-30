import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserStories, StoryData } from '../services/api';

export function StoriesPage() {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storiesData = await getUserStories();
      setStories(storiesData);
    } catch (error: any) {
      console.error('Erro ao carregar histórias:', error);
      setError('Erro ao carregar suas histórias. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const truncateText = (text: string | null, maxLength: number): string => {
    if (!text) return 'Sem sinopse';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getAssetCountColor = (count: number): string => {
    if (count === 0) return 'text-gray-500';
    if (count <= 2) return 'text-yellow-400';
    if (count <= 5) return 'text-blue-400';
    return 'text-green-400';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-primary text-xl">Carregando suas histórias...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-title text-5xl font-bold text-primary">Minhas Histórias</h2>
        <Link to="/tools/stories/new">
          <button className="bg-primary hover:bg-primary/90 text-background font-bold py-2 px-6 rounded-lg transition-colors">
            + Escrever Nova Lenda
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={fetchStories}
            className="ml-4 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <img src="/icons/Gerenciar Histórias.png" alt="Histórias" className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-title text-primary mb-2">Nenhuma história criada ainda</h3>
          <p className="text-text-muted mb-6">
            Comece a escrever suas próprias lendas épicas!
          </p>
          <Link to="/tools/stories/new">
            <button className="bg-primary hover:bg-primary/90 text-background font-bold py-3 px-8 rounded-lg transition-colors">
              Escrever Primeira História
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/tools/stories/${story.id}`}
              className="block bg-surface/80 border border-secondary/30 rounded-lg p-6 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:scale-105"
            >
              {/* Cabeçalho da História */}
              <div className="mb-4">
                <h3 className="font-title text-xl text-primary mb-2 line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {truncateText(story.synopsis, 120)}
                </p>
              </div>

              {/* Contadores de Assets */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-background/50 rounded border border-gray-700">
                  <div className={`text-lg font-bold ${getAssetCountColor(story.items.length)}`}>
                    {story.items.length}
                  </div>
                  <div className="text-xs text-text-muted">Itens</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded border border-gray-700">
                  <div className={`text-lg font-bold ${getAssetCountColor(story.monsters.length)}`}>
                    {story.monsters.length}
                  </div>
                  <div className="text-xs text-text-muted">Monstros</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded border border-gray-700">
                  <div className={`text-lg font-bold ${getAssetCountColor(story.npcs.length)}`}>
                    {story.npcs.length}
                  </div>
                  <div className="text-xs text-text-muted">NPCs</div>
                </div>
              </div>

              {/* Assets Preview */}
              {(story.items.length > 0 || story.monsters.length > 0 || story.npcs.length > 0) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-text mb-2">Assets Inclusos:</h4>
                  <div className="space-y-1 text-xs text-text-muted max-h-20 overflow-y-auto">
                    {story.items.slice(0, 3).map((item) => (
                      <div key={`item-${item.id}`} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                    {story.monsters.slice(0, 3).map((monster) => (
                      <div key={`monster-${monster.id}`} className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        <span className="truncate">{monster.name}</span>
                      </div>
                    ))}
                    {story.npcs.slice(0, 3).map((npc) => (
                      <div key={`npc-${npc.id}`} className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        <span className="truncate">{npc.name}</span>
                      </div>
                    ))}
                    {(story.items.length + story.monsters.length + story.npcs.length) > 9 && (
                      <div className="text-center text-text-muted italic">
                        +{(story.items.length + story.monsters.length + story.npcs.length) - 9} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Indicador de clique */}
              <div className="text-center pt-2 border-t border-secondary/20">
                <span className="text-xs text-text-muted">Clique para ver detalhes</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Estatísticas Gerais */}
      {stories.length > 0 && (
        <div className="mt-12 bg-surface/50 border border-secondary/30 rounded-lg p-6">
          <h3 className="font-title text-xl text-primary mb-4">Estatísticas das Suas Histórias</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stories.length}</div>
              <div className="text-sm text-text-muted">Histórias Criadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {stories.reduce((total, story) => total + story.items.length, 0)}
              </div>
              <div className="text-sm text-text-muted">Total de Itens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {stories.reduce((total, story) => total + story.monsters.length, 0)}
              </div>
              <div className="text-sm text-text-muted">Total de Monstros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stories.reduce((total, story) => total + story.npcs.length, 0)}
              </div>
              <div className="text-sm text-text-muted">Total de NPCs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}