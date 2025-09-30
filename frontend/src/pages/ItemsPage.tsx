import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreateItemModal } from '../components/CreateItemModal';
import { getUserItems, ItemData } from '../services/api';

export function ItemsPage() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsData = await getUserItems();
      setItems(itemsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar itens');
      console.error('Erro ao buscar itens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400';
      case 'Uncommon': return 'text-green-400';
      case 'Rare': return 'text-blue-400';
      case 'Very Rare': return 'text-purple-400';
      case 'Legendary': return 'text-orange-400';
      case 'Artifact': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'Comum';
      case 'Uncommon': return 'Incomum';
      case 'Rare': return 'Raro';
      case 'Very Rare': return 'Muito Raro';
      case 'Legendary': return 'Lendário';
      case 'Artifact': return 'Artefato';
      default: return rarity;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Mundane': return 'Mundano';
      case 'Weapon': return 'Arma';
      case 'Armor': return 'Armadura';
      case 'Shield': return 'Escudo';
      case 'Potion': return 'Poção';
      case 'Scroll': return 'Pergaminho';
      case 'Wand': return 'Varinha';
      case 'Ring': return 'Anel';
      case 'Amulet': return 'Amuleto';
      case 'Tool': return 'Ferramenta';
      case 'Adventuring Gear': return 'Equipamento de Aventura';
      case 'Wondrous Item': return 'Item Maravilhoso';
      default: return type;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <div className="text-center font-title text-primary text-2xl">
        Carregando arsenal...
      </div>
    );
  }

  return (
    <>
      <CreateItemModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onItemCreated={fetchItems} 
      />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-title text-5xl font-bold text-primary">Arsenal de Itens</h2>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-primary hover:bg-primary/90 text-background font-bold py-2 px-6 rounded-lg transition-colors"
        >
          + Forjar Novo Item
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-surface/70 p-4 rounded-lg border border-secondary/30">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <img src="/icons/Equipamentos.png" alt="Arsenal" className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="font-title text-2xl text-primary mb-2">Arsenal Vazio</h3>
            <p className="text-text-muted mb-6">
              Você ainda não forjou nenhum item. Que tal criar seu primeiro equipamento épico?
            </p>
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-background font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Forjar Primeiro Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link 
                key={item.id} 
                to={`/tools/items/${item.id}`}
                className="bg-background/50 border border-secondary/50 rounded-lg p-4 hover:border-primary/50 transition-colors block"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-title text-lg text-primary font-semibold">
                    {item.name}
                  </h3>
                  <span className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                    {getRarityLabel(item.rarity)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <span className="inline-block bg-secondary/30 text-text-muted text-xs px-2 py-1 rounded">
                    {getTypeLabel(item.type)}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-text-muted text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
                
                {!item.description && (
                  <p className="text-text-muted/50 text-sm italic">
                    Sem descrição
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}