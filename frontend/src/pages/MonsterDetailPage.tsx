import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMonsterById, updateMonster, deleteMonster, MonsterData, MonsterUpdateData } from '../services/api';

export function MonsterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MonsterUpdateData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadMonster = async () => {
      try {
        setLoading(true);
        const data = await getMonsterById(id);
        setMonster(data);
        setFormData({
          size: data.size,
          type: data.type,
          armor_class: data.armor_class,
          hit_points: data.hit_points,
          speed: data.speed,
          actions: data.actions,
          challenge_rating: data.challenge_rating,
        });
      } catch (error) {
        console.error('Erro ao carregar monstro:', error);
        setError('Erro ao carregar os dados do monstro');
      } finally {
        setLoading(false);
      }
    };

    loadMonster();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'armor_class' ? parseInt(value) || 0 : value 
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const updatedMonster = await updateMonster(id, formData);
      setMonster(updatedMonster);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Erro ao atualizar o monstro:', error);
      setError('Erro ao atualizar o monstro');
    }
  };

  const handleDelete = async () => {
    if (!id || !monster || !window.confirm(`Tem certeza que deseja banir "${monster.name}" do seu bestiário?`)) return;
    
    try {
      await deleteMonster(id);
      navigate('/tools/monsters');
    } catch (error) {
      console.error('Erro ao deletar o monstro:', error);
      setError('Erro ao deletar o monstro');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-primary text-xl">Carregando criatura...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-surface/80 p-8 rounded-lg shadow-lg border border-red-500/30">
        <div className="text-red-400 text-center">
          <h2 className="text-2xl font-bold mb-4">Erro</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/tools/monsters')}
            className="mt-4 bg-primary text-background font-bold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Voltar ao Bestiário
          </button>
        </div>
      </div>
    );
  }

  if (!monster) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-surface/80 p-8 rounded-lg shadow-lg border border-secondary/30">
        <div className="text-text-muted text-center">
          <h2 className="text-2xl font-bold mb-4">Monstro não encontrado</h2>
          <button 
            onClick={() => navigate('/tools/monsters')}
            className="bg-primary text-background font-bold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Voltar ao Bestiário
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface/80 p-8 rounded-lg shadow-lg border border-secondary/30">
      {!isEditing ? (
        // --- MODO DE VISUALIZAÇÃO ---
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-title text-4xl text-primary mb-2">{monster.name}</h1>
              <p className="text-text-muted text-lg">
                {monster.size} {monster.type}, ND {monster.challenge_rating}
              </p>
            </div>
            <button 
              onClick={() => navigate('/tools/monsters')}
              className="bg-secondary text-text font-bold py-2 px-4 rounded-lg hover:bg-secondary/80 transition-colors"
            >
              ← Voltar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Classe de Armadura</h3>
                <p className="text-text">{monster.armor_class}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Pontos de Vida</h3>
                <p className="text-text">{monster.hit_points}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Velocidade</h3>
                <p className="text-text">{monster.speed}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Tamanho</h3>
                <p className="text-text capitalize">{monster.size}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Tipo</h3>
                <p className="text-text capitalize">{monster.type}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Nível de Desafio</h3>
                <p className="text-text">{monster.challenge_rating}</p>
              </div>
            </div>
          </div>

          {monster.actions && (
            <div className="bg-background/50 p-4 rounded-lg mb-8">
              <h3 className="font-semibold text-primary mb-2">Ações</h3>
              <p className="text-text whitespace-pre-wrap">{monster.actions}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-primary text-background font-bold py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors"
            >
              <img src="/icons/Editar.png" alt="Editar" style={{width: '16px', height: '16px', marginRight: '6px', display: 'inline'}} /> Editar Criatura
            </button>
            <button 
              onClick={handleDelete} 
              className="bg-red-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-800 transition-colors"
            >
              <img src="/icons/Lixeira.png" alt="Deletar" style={{width: '16px', height: '16px', marginRight: '6px', display: 'inline'}} /> Banir do Bestiário
            </button>
          </div>
        </div>
      ) : (
        // --- MODO DE EDIÇÃO ---
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-title text-3xl text-primary">Editando: {monster.name}</h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-primary font-semibold mb-2">Tamanho</label>
                <select
                  name="size"
                  value={formData.size || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none"
                >
                  <option value="">Selecione o tamanho</option>
                  <option value="tiny">Miúdo</option>
                  <option value="small">Pequeno</option>
                  <option value="medium">Médio</option>
                  <option value="large">Grande</option>
                  <option value="huge">Enorme</option>
                  <option value="gargantuan">Colossal</option>
                </select>
              </div>

              <div>
                <label className="block text-primary font-semibold mb-2">Tipo</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type || ''}
                  onChange={handleChange}
                  placeholder="Ex: humanoid, beast, dragon..."
                  className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-2">Classe de Armadura</label>
                <input
                  type="number"
                  name="armor_class"
                  value={formData.armor_class || ''}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-primary font-semibold mb-2">Pontos de Vida</label>
                <input
                  type="text"
                  name="hit_points"
                  value={formData.hit_points || ''}
                  onChange={handleChange}
                  placeholder="Ex: 58 (9d8 + 18)"
                  className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-2">Velocidade</label>
                <input
                  type="text"
                  name="speed"
                  value={formData.speed || ''}
                  onChange={handleChange}
                  placeholder="Ex: 9m, voo 18m"
                  className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-2">Nível de Desafio</label>
                <input
                  type="text"
                  name="challenge_rating"
                  value={formData.challenge_rating || ''}
                  onChange={handleChange}
                  placeholder="Ex: 1/4, 1, 5, 10..."
                  className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-primary font-semibold mb-2">Ações</label>
            <textarea
              name="actions"
              value={formData.actions || ''}
              onChange={handleChange}
              rows={6}
              placeholder="Descreva as ações que esta criatura pode realizar em combate..."
              className="w-full p-3 bg-background border border-secondary/30 rounded-lg text-text focus:border-primary focus:outline-none resize-vertical"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              💾 Salvar Alterações
            </button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setError(null);
                // Restaurar dados originais
                setFormData({
                  size: monster.size,
                  type: monster.type,
                  armor_class: monster.armor_class,
                  hit_points: monster.hit_points,
                  speed: monster.speed,
                  actions: monster.actions,
                  challenge_rating: monster.challenge_rating,
                });
              }} 
              className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <img src="/icons/Cancelar.png" alt="Cancelar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}