import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCharacterById, CharacterData } from '../services/api';

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCharacter = async () => {
      try {
        const data = await getCharacterById(id);
        setCharacter(data);
      } catch (err) {
        setError("Não foi possível carregar o personagem.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  if (loading) return <div className="text-center font-title text-primary text-2xl">Carregando ficha do herói...</div>;
  if (error) return <div className="text-center font-title text-red-500 text-2xl">{error}</div>;
  if (!character) return <div className="text-center font-title text-text-muted text-2xl">Personagem não encontrado.</div>;

  // Função para calcular o modificador de atributo
  const getModifier = (value: number): string => {
    const modifier = Math.floor((value - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-surface/50 p-6">
      <div className="w-full max-w-5xl mx-auto bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-secondary/30">
        {/* Cabeçalho do Personagem */}
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl text-primary mb-2">{character.name}</h1>
          <p className="text-text-muted text-xl">
            {character.race} {character.character_class} - Nível {character.level}
          </p>
        </div>

        {/* Atributos Principais */}
        <div className="mb-8">
          <h2 className="font-title text-2xl text-primary mb-4 text-center">Atributos</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(character.attributes).map(([attr, value]) => {
              const attrNames: { [key: string]: string } = {
                strength: 'Força',
                dexterity: 'Destreza',
                constitution: 'Constituição',
                intelligence: 'Inteligência',
                wisdom: 'Sabedoria',
                charisma: 'Carisma'
              };
              
              return (
                <div key={attr} className="bg-background/50 p-4 rounded-lg text-center border border-secondary/20 hover:border-primary/30 transition-colors">
                  <p className="font-body text-xs uppercase text-text-muted mb-1">
                    {attrNames[attr] || attr}
                  </p>
                  <p className="font-title text-3xl text-primary mb-1">{value}</p>
                  <p className="font-body text-sm text-accent">
                    {getModifier(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            <div className="bg-background/30 p-6 rounded-lg border border-secondary/20">
              <h3 className="font-title text-xl text-primary mb-4">Informações Básicas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Raça:</span>
                  <span className="text-primary font-medium">{character.race}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Classe:</span>
                  <span className="text-primary font-medium">{character.character_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Nível:</span>
                  <span className="text-primary font-medium">{character.level}</span>
                </div>
              </div>
            </div>

            <div className="bg-background/30 p-6 rounded-lg border border-secondary/20">
              <h3 className="font-title text-xl text-primary mb-4">Estatísticas de Combate</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Pontos de Vida:</span>
                  <span className="text-primary font-medium">
                    {8 + Math.floor((character.attributes.constitution - 10) / 2) + (character.level - 1) * (5 + Math.floor((character.attributes.constitution - 10) / 2))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Classe de Armadura:</span>
                  <span className="text-primary font-medium">
                    {10 + Math.floor((character.attributes.dexterity - 10) / 2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Iniciativa:</span>
                  <span className="text-primary font-medium">
                    {getModifier(character.attributes.dexterity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            <div className="bg-background/30 p-6 rounded-lg border border-secondary/20">
              <h3 className="font-title text-xl text-primary mb-4">Testes de Resistência</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Força:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.strength)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Destreza:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.dexterity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Constituição:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.constitution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Inteligência:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.intelligence)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Sabedoria:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.wisdom)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Carisma:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.charisma)}</span>
                </div>
              </div>
            </div>

            <div className="bg-background/30 p-6 rounded-lg border border-secondary/20">
              <h3 className="font-title text-xl text-primary mb-4">Perícias Principais</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Percepção:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.wisdom)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Investigação:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.intelligence)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Atletismo:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.strength)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Furtividade:</span>
                  <span className="text-primary font-medium">{getModifier(character.attributes.dexterity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Expansão Futura */}
        <div className="bg-background/20 p-6 rounded-lg border border-secondary/20 text-center">
          <h3 className="font-title text-xl text-primary mb-2">Ficha em Desenvolvimento</h3>
          <p className="text-text-muted">
            Em breve: Inventário, Magias, Histórico, Equipamentos e muito mais!
          </p>
        </div>
      </div>
    </div>
  );
}