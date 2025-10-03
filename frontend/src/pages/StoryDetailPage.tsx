import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getStoryById, 
  updateStory, 
  deleteStory, 
  getUserItems, 
  getUserMonsters, 
  getUserNpcs,
  StoryData, 
  StoryUpdateData,
  ItemData,
  MonsterData,
  NpcData
} from '../services/api';

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados principais
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para assets disponíveis
  const [availableItems, setAvailableItems] = useState<ItemData[]>([]);
  const [availableMonsters, setAvailableMonsters] = useState<MonsterData[]>([]);
  const [availableNpcs, setAvailableNpcs] = useState<NpcData[]>([]);
  
  // Estados do formulário de edição
  const [formData, setFormData] = useState<StoryUpdateData>({
    title: '',
    synopsis: '',
    item_ids: [],
    monster_ids: [],
    npc_ids: []
  });
  
  // Carrega a história e todos os assets disponíveis
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Carrega a história e todos os assets em paralelo
        const [storyData, itemsData, monstersData, npcsData] = await Promise.all([
          getStoryById(id),
          getUserItems(),
          getUserMonsters(),
          getUserNpcs()
        ]);
        
        setStory(storyData);
        setAvailableItems(itemsData);
        setAvailableMonsters(monstersData);
        setAvailableNpcs(npcsData);
        
        // Inicializa o formulário com os dados atuais
        setFormData({
          title: storyData.title,
          synopsis: storyData.synopsis,
          item_ids: storyData.items.map(item => item.id),
          monster_ids: storyData.monsters.map(monster => monster.id),
          npc_ids: storyData.npcs.map(npc => npc.id)
        });
        
      } catch (err) {
        setError('Erro ao carregar história');
        console.error('Erro ao carregar história:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Atualiza a história
  const handleUpdate = async () => {
    if (!id || !story) return;
    
    try {
      const updatedStory = await updateStory(id, formData);
      setStory(updatedStory);
      setIsEditing(false);
    } catch (err) {
      setError('Erro ao atualizar história');
      console.error('Erro ao atualizar história:', err);
    }
  };
  
  // Deleta a história
  const handleDelete = async () => {
    if (!id || !story) return;
    
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar a história "${story.title}"? Esta ação não pode ser desfeita.`
    );
    
    if (confirmDelete) {
      try {
        await deleteStory(id);
        navigate('/tools/stories');
      } catch (err) {
        setError('Erro ao deletar história');
        console.error('Erro ao deletar história:', err);
      }
    }
  };
  
  // Cancela a edição
  const handleCancelEdit = () => {
    if (!story) return;
    
    setFormData({
      title: story.title,
      synopsis: story.synopsis,
      item_ids: story.items.map(item => item.id),
      monster_ids: story.monsters.map(monster => monster.id),
      npc_ids: story.npcs.map(npc => npc.id)
    });
    setIsEditing(false);
  };
  
  // Manipula mudanças nos checkboxes de assets
  const handleAssetToggle = (assetId: string, assetType: 'item_ids' | 'monster_ids' | 'npc_ids') => {
    setFormData(prev => {
      const currentIds = prev[assetType] || [];
      const newIds = currentIds.includes(assetId)
        ? currentIds.filter(id => id !== assetId)
        : [...currentIds, assetId];
      
      return {
        ...prev,
        [assetType]: newIds
      };
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Carregando história...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Link to="/tools/stories" className="text-purple-400 hover:text-purple-300">
              ← Voltar para Histórias
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!story) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">História não encontrada</p>
            <Link to="/tools/stories" className="text-purple-400 hover:text-purple-300">
              ← Voltar para Histórias
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/tools/stories" className="text-purple-400 hover:text-purple-300">
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editando História' : story.title}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <img src="/icons/Editar.png" alt="Editar" style={{width: '16px', height: '16px', marginRight: '6px', display: 'inline'}} /> Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <img src="/icons/Deletar.png" alt="Deletar" style={{width: '16px', height: '16px', marginRight: '6px', display: 'inline'}} /> Deletar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <img src="/icons/Concluído.png" alt="Salvar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <img src="/icons/Deletar.png" alt="Cancelar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Cancelar
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Conteúdo */}
        {!isEditing ? (
          // Modo de visualização
          <div className="space-y-8">
            {/* Informações básicas */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📖 Informações da História</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-purple-400">Título</h3>
                  <p className="text-gray-300">{story.title}</p>
                </div>
                {story.synopsis && (
                  <div>
                    <h3 className="text-lg font-medium text-purple-400">Sinopse</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{story.synopsis}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Assets associados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Itens */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">🎒 Itens ({story.items.length})</h3>
                {story.items.length > 0 ? (
                  <div className="space-y-2">
                    {story.items.map(item => (
                      <Link
                        key={item.id}
                        to={`/tools/items/${item.id}`}
                        className="block p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.type} • {item.rarity}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum item associado</p>
                )}
              </div>
              
              {/* Monstros */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-400">👹 Monstros ({story.monsters.length})</h3>
                {story.monsters.length > 0 ? (
                  <div className="space-y-2">
                    {story.monsters.map(monster => (
                      <Link
                        key={monster.id}
                        to={`/tools/monsters/${monster.id}`}
                        className="block p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      >
                        <p className="font-medium">{monster.name}</p>
                        <p className="text-sm text-gray-400">{monster.type} • CR {monster.challenge_rating}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum monstro associado</p>
                )}
              </div>
              
              {/* NPCs */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">👥 NPCs ({story.npcs.length})</h3>
                {story.npcs.length > 0 ? (
                  <div className="space-y-2">
                    {story.npcs.map(npc => (
                      <Link
                        key={npc.id}
                        to={`/tools/npcs/${npc.id}`}
                        className="block p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      >
                        <p className="font-medium">{npc.name}</p>
                        <p className="text-sm text-gray-400">{npc.role}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum NPC associado</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Modo de edição
          <div className="space-y-8">
            {/* Formulário de edição */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">📝 Editar História</h2>
              
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o título da história"
                  />
                </div>
                
                {/* Sinopse */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sinopse
                  </label>
                  <textarea
                    value={formData.synopsis || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, synopsis: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Descreva a sinopse da história"
                  />
                </div>
              </div>
            </div>
            
            {/* Seletores de Assets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Seletor de Itens */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">🎒 Selecionar Itens</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableItems.map(item => (
                    <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.item_ids?.includes(item.id) || false}
                        onChange={() => handleAssetToggle(item.id, 'item_ids')}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.type} • {item.rarity}</p>
                      </div>
                    </label>
                  ))}
                  {availableItems.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum item disponível</p>
                  )}
                </div>
              </div>
              
              {/* Seletor de Monstros */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-400">👹 Selecionar Monstros</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableMonsters.map(monster => (
                    <label key={monster.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.monster_ids?.includes(monster.id) || false}
                        onChange={() => handleAssetToggle(monster.id, 'monster_ids')}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{monster.name}</p>
                        <p className="text-sm text-gray-400">{monster.type} • CR {monster.challenge_rating}</p>
                      </div>
                    </label>
                  ))}
                  {availableMonsters.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum monstro disponível</p>
                  )}
                </div>
              </div>
              
              {/* Seletor de NPCs */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">👥 Selecionar NPCs</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableNpcs.map(npc => (
                    <label key={npc.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.npc_ids?.includes(npc.id) || false}
                        onChange={() => handleAssetToggle(npc.id, 'npc_ids')}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{npc.name}</p>
                        <p className="text-sm text-gray-400">{npc.role}</p>
                      </div>
                    </label>
                  ))}
                  {availableNpcs.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum NPC disponível</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};