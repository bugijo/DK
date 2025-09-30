import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createStory, 
  getUserItems, 
  getUserMonsters, 
  getUserNpcs, 
  ItemData, 
  MonsterData, 
  NpcData,
  StoryCreateData
} from '../services/api';

// Componente reutilizável para os seletores de assets
interface AssetSelectorProps {
  title: string;
  items: (ItemData | MonsterData | NpcData)[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({ title, items, selectedIds, onToggle }) => (
  <div>
    <h3 className="font-title text-lg text-primary mb-2">{title}</h3>
    <div className="bg-background/50 p-2 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
      {items.length > 0 ? (
        items.map(item => (
          <label key={item.id} className="flex items-center space-x-3 p-1.5 hover:bg-surface/50 rounded cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedIds.includes(item.id)} 
              onChange={() => onToggle(item.id)} 
              className="form-checkbox bg-background border-gray-600 text-primary focus:ring-primary"
            />
            <span className="text-text">{item.name}</span>
          </label>
        ))
      ) : (
        <p className="text-text-muted text-sm p-2">Nenhum {title.toLowerCase()} criado.</p>
      )}
    </div>
  </div>
);

export function CreateStoryPage() {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [items, setItems] = useState<ItemData[]>([]);
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [npcs, setNpcs] = useState<NpcData[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedMonsterIds, setSelectedMonsterIds] = useState<string[]>([]);
  const [selectedNpcIds, setSelectedNpcIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const [itemData, monsterData, npcData] = await Promise.all([
          getUserItems(),
          getUserMonsters(),
          getUserNpcs()
        ]);
        setItems(itemData);
        setMonsters(monsterData);
        setNpcs(npcData);
      } catch (error) {
        console.error('Erro ao carregar assets:', error);
        setError('Erro ao carregar seus itens, monstros e NPCs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleToggleItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleMonster = (id: string) => {
    setSelectedMonsterIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleNpc = (id: string) => {
    setSelectedNpcIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('O título da história é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const storyData: StoryCreateData = {
      title: title.trim(),
      synopsis: synopsis.trim() || null,
      item_ids: selectedItemIds,
      monster_ids: selectedMonsterIds,
      npc_ids: selectedNpcIds
    };

    try {
      await createStory(storyData);
      navigate('/tools/stories');
    } catch (error: any) {
      console.error('Erro ao criar história:', error);
      setError(error.response?.data?.detail || 'Erro ao criar história. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-primary text-xl">Carregando seus assets...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface/80 p-8 rounded-lg shadow-lg border border-secondary/30">
      <h2 className="font-title text-3xl text-primary text-center mb-6">Escrever Nova Lenda</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
            Título da História *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-gray-600 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Digite o título da sua história épica..."
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Campo Sinopse */}
        <div>
          <label htmlFor="synopsis" className="block text-sm font-medium text-text mb-2">
            Sinopse
          </label>
          <textarea
            id="synopsis"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-background border border-gray-600 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            placeholder="Descreva brevemente sua história... (opcional)"
            disabled={isSubmitting}
          />
        </div>

        {/* Seletores de Assets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetSelector
            title="Itens"
            items={items}
            selectedIds={selectedItemIds}
            onToggle={handleToggleItem}
          />
          
          <AssetSelector
            title="Monstros"
            items={monsters}
            selectedIds={selectedMonsterIds}
            onToggle={handleToggleMonster}
          />
          
          <AssetSelector
            title="NPCs"
            items={npcs}
            selectedIds={selectedNpcIds}
            onToggle={handleToggleNpc}
          />
        </div>

        {/* Resumo da Seleção */}
        <div className="bg-background/30 p-4 rounded-lg border border-gray-700">
          <h4 className="font-title text-md text-primary mb-2">Resumo da História</h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-text-muted">
            <div>
              <span className="font-medium text-text">{selectedItemIds.length}</span> itens selecionados
            </div>
            <div>
              <span className="font-medium text-text">{selectedMonsterIds.length}</span> monstros selecionados
            </div>
            <div>
              <span className="font-medium text-text">{selectedNpcIds.length}</span> NPCs selecionados
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/tools/stories')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 text-background font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar História'}
          </button>
        </div>
      </form>
    </div>
  );
}