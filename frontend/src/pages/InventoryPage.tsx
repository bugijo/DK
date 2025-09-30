import React, { useState, useEffect } from 'react';
import { getMyInventory, UserInventoryData } from '../services/api';
import { AssetCard } from '../components/AssetCard';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <section className="mb-8">
    <h3 className="font-title text-2xl text-primary/90 border-b-2 border-secondary/30 pb-2 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </section>
);

export function InventoryPage() {
  const [inventory, setInventory] = useState<UserInventoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyInventory().then(data => {
      setInventory(data);
    }).catch(err => {
      console.error("Erro ao buscar inventário:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center font-title text-primary text-2xl">Organizando o arsenal...</div>;
  if (!inventory) return <div className="text-center text-text-muted">Não foi possível carregar o inventário.</div>;

  return (
    <div>
      <h2 className="font-title text-5xl font-bold text-primary mb-8">Meu Inventário</h2>
      
      <Section title="Meus Personagens">
        {inventory.characters.map(char => (
          <AssetCard 
            key={char.id} 
            id={char.id} 
            name={char.name} 
            line1={`${char.race} ${char.character_class}`} 
            line2={`Nível ${char.level}`} 
            linkTo={`/characters/${char.id}`} 
          />
        ))}
      </Section>
      
      <Section title="Minhas Histórias">
        {inventory.stories.map(story => (
          <AssetCard 
            key={story.id} 
            id={story.id} 
            name={story.title} 
            line1={story.synopsis || ''} 
            linkTo={`/tools/stories/${story.id}`} 
          />
        ))}
      </Section>
      
      <Section title="Meus Itens">
        {inventory.items.map(item => (
          <AssetCard 
            key={item.id} 
            id={item.id} 
            name={item.name} 
            line1={`${item.rarity} ${item.type}`} 
            linkTo={`/tools/items/${item.id}`} 
          />
        ))}
      </Section>

      <Section title="Meu Bestiário">
        {inventory.monsters.map(monster => (
          <AssetCard 
            key={monster.id} 
            id={monster.id} 
            name={monster.name} 
            line1={`${monster.size} ${monster.type}`} 
            line2={`ND ${monster.challenge_rating}`} 
            linkTo={`/tools/monsters/${monster.id}`} 
          />
        ))}
      </Section>
      
      <Section title="Meus NPCs">
        {inventory.npcs.map(npc => (
          <AssetCard 
            key={npc.id} 
            id={npc.id} 
            name={npc.name} 
            line1={npc.role || ''} 
            line2={npc.location || ''} 
            linkTo={`/tools/npcs/${npc.id}`} 
          />
        ))}
      </Section>
    </div>
  );
}