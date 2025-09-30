import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserCharacters, CharacterData } from '../services/api';

export function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const data = await getUserCharacters();
      setCharacters(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar personagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-primary text-xl">Carregando personagens...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-title text-5xl font-bold text-primary">Meus Personagens</h2>
          <Link to="/characters/new">
            <button className="bg-primary hover:bg-primary/90 text-background font-bold py-2 px-6 rounded-lg transition-colors">
              + Criar Novo
            </button>
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-text-muted text-xl mb-4">
              Você ainda não criou nenhum personagem.
            </div>
            <Link to="/characters/new">
              <button className="bg-primary hover:bg-primary/90 text-background font-bold py-3 px-8 rounded-lg transition-colors">
                Criar Primeiro Personagem
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map(char => (
              <Link to={`/characters/${char.id}`} key={char.id}>
                <div className="bg-surface/70 backdrop-blur-sm p-6 rounded-lg border border-secondary/30 hover:border-primary/50 cursor-pointer transition-all transform hover:scale-105">
                  <div className="mb-4">
                    <h3 className="font-title text-xl text-primary truncate mb-1">{char.name}</h3>
                    <p className="text-text-muted">
                      {char.race} {char.character_class} - Nível {char.level}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-text-muted">FOR</div>
                      <div className="text-text font-bold">
                        {char.attributes?.strength || 10} ({getModifier(char.attributes?.strength || 10)})
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-muted">DES</div>
                      <div className="text-text font-bold">
                        {char.attributes?.dexterity || 10} ({getModifier(char.attributes?.dexterity || 10)})
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-muted">CON</div>
                      <div className="text-text font-bold">
                        {char.attributes?.constitution || 10} ({getModifier(char.attributes?.constitution || 10)})
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-muted">INT</div>
                      <div className="text-text font-bold">
                        {char.attributes?.intelligence || 10} ({getModifier(char.attributes?.intelligence || 10)})
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-muted">SAB</div>
                      <div className="text-text font-bold">
                        {char.attributes?.wisdom || 10} ({getModifier(char.attributes?.wisdom || 10)})
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-muted">CAR</div>
                      <div className="text-text font-bold">
                        {char.attributes?.charisma || 10} ({getModifier(char.attributes?.charisma || 10)})
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-secondary/30">
                    <div className="w-full bg-secondary/20 hover:bg-secondary/30 text-text font-medium py-2 rounded transition-colors text-center">
                      Ver Ficha Completa
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}