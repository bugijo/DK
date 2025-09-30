import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, ItemCreateData } from '../services/api';

export function CreateItemPage() {
  const [formData, setFormData] = useState<ItemCreateData>({
    name: '',
    description: null,
    type: 'Mundane',
    rarity: 'Common',
    image_url: '',
    price: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await createItem(formData);
      navigate('/tools');
    } catch (error) {
      console.error('Erro ao criar item:', error);
      setError('Erro ao criar item. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-4">
            FORJA DO MESTRE
          </h1>
          <h2 className="font-title text-2xl text-amber-300 mb-2">Criar Novo Item</h2>
          <p className="text-gray-400">Forje armas, armaduras e bugigangas mágicas para suas aventuras</p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/20 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Item */}
            <div>
              <label htmlFor="name" className="block text-amber-300 font-semibold mb-2">
                Nome do Item *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
                placeholder="Ex: Espada Flamejante, Armadura de Couro Élfico..."
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-amber-300 font-semibold mb-2">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all resize-vertical"
                placeholder="Descreva as propriedades, aparência e história do item..."
              />
            </div>

            {/* Tipo do Item */}
            <div>
              <label htmlFor="type" className="block text-amber-300 font-semibold mb-2">
                Tipo do Item *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
              >
                <option value="Mundane">Mundano</option>
                <option value="Magic">Mágico</option>
                <option value="Weapon">Arma</option>
                <option value="Armor">Armadura</option>
                <option value="Shield">Escudo</option>
                <option value="Potion">Poção</option>
                <option value="Scroll">Pergaminho</option>
                <option value="Wondrous">Item Maravilhoso</option>
                <option value="Tool">Ferramenta</option>
                <option value="Treasure">Tesouro</option>
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label htmlFor="rarity" className="block text-amber-300 font-semibold mb-2">
                Raridade *
              </label>
              <select
                id="rarity"
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
              >
                <option value="Common">Comum</option>
                <option value="Uncommon">Incomum</option>
                <option value="Rare">Raro</option>
                <option value="Very Rare">Muito Raro</option>
                <option value="Legendary">Lendário</option>
                <option value="Artifact">Artefato</option>
              </select>
            </div>

            {/* URL da Imagem */}
            <div>
              <label htmlFor="image_url" className="block text-amber-300 font-semibold mb-2">
                URL da Imagem
              </label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
                placeholder="https://game-icons.net/icons/ffffff/000000/1x1/lorc/sword.svg"
              />
            </div>

            {/* Preço */}
            <div>
              <label htmlFor="price" className="block text-amber-300 font-semibold mb-2">
                Preço (moedas de ouro)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
                placeholder="0"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-center">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/tools')}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Forjando...
                  </span>
                ) : (
                  '🔨 Forjar Item'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>💡 Dica: Itens mágicos e raros podem ter propriedades especiais que afetam o gameplay</p>
        </div>
      </div>
    </div>
  );
}