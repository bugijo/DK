import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNpcById, updateNpc, deleteNpc, NpcData, NpcUpdateData } from '../services/api';

export const NpcDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [npc, setNpc] = useState<NpcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NpcUpdateData>({
    description: '',
    role: '',
    location: '',
    notes: ''
  });

  const loadNpc = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const npcData = await getNpcById(id);
      setNpc(npcData);
      setFormData({
        description: npcData.description || '',
        role: npcData.role || '',
        location: npcData.location || '',
        notes: npcData.notes || ''
      });
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar NPC:', err);
      setError('Erro ao carregar NPC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNpc();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !npc) return;

    try {
      const updatedNpc = await updateNpc(id, formData);
      setNpc(updatedNpc);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Erro ao atualizar NPC:', err);
      setError('Erro ao atualizar NPC');
    }
  };

  const handleDelete = async () => {
    if (!id || !npc) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja deletar o NPC "${npc.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      await deleteNpc(id);
      navigate('/tools/npcs');
    } catch (err) {
      console.error('Erro ao deletar NPC:', err);
      setError('Erro ao deletar NPC');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Carregando NPC...</p>
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
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => navigate('/tools/npcs')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Voltar para NPCs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!npc) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">NPC não encontrado</p>
            <button
              onClick={() => navigate('/tools/npcs')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Voltar para NPCs
            </button>
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
          <div>
            <button
              onClick={() => navigate('/tools/npcs')}
              className="text-red-400 hover:text-red-300 mb-2 flex items-center gap-2"
            >
              ← Voltar para NPCs
            </button>
            <h1 className="text-3xl font-bold text-red-400">{npc.name}</h1>
          </div>
          
          {!isEditing && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Deletar
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {!isEditing ? (
            // Modo de visualização
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Descrição</h3>
                <p className="text-gray-300">{npc.description || 'Nenhuma descrição fornecida'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Função/Papel</h3>
                <p className="text-gray-300">{npc.role || 'Não especificado'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Localização</h3>
                <p className="text-gray-300">{npc.location || 'Não especificada'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Notas</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{npc.notes || 'Nenhuma nota adicional'}</p>
              </div>
            </div>
          ) : (
            // Modo de edição
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Descreva o NPC..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Função/Papel
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Comerciante, Guarda, Nobre..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Taverna do Javali Dourado, Castelo Real..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Notas adicionais sobre o NPC, personalidade, motivações, etc..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      description: npc.description || '',
                      role: npc.role || '',
                      location: npc.location || '',
                      notes: npc.notes || ''
                    });
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};