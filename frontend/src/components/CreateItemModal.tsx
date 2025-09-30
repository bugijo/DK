import React, { useState } from 'react';
import { createItem, ItemCreateData } from '../services/api';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: () => void;
}

export function CreateItemModal({ isOpen, onClose, onItemCreated }: CreateItemModalProps) {
  const [formData, setFormData] = useState<ItemCreateData>({
    name: '',
    description: '',
    type: 'Mundane',
    rarity: 'Common',
    image_url: '',
    price: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createItem(formData);
      onItemCreated();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'Mundane',
        rarity: 'Common',
        image_url: '',
        price: 0
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-lg p-8 w-full max-w-lg border border-secondary/50" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-title text-2xl text-primary mb-6">Forjar Novo Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-muted text-sm mb-1">Nome do Item</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-background border border-gray-600 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-background border border-gray-600 focus:border-primary focus:outline-none"
            >
              <option value="Mundane">Mundano</option>
              <option value="Weapon">Arma</option>
              <option value="Armor">Armadura</option>
              <option value="Shield">Escudo</option>
              <option value="Potion">Poção</option>
              <option value="Scroll">Pergaminho</option>
              <option value="Wand">Varinha</option>
              <option value="Ring">Anel</option>
              <option value="Amulet">Amuleto</option>
              <option value="Tool">Ferramenta</option>
              <option value="Adventuring Gear">Equipamento de Aventura</option>
              <option value="Wondrous Item">Item Maravilhoso</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Raridade</label>
            <select
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-background border border-gray-600 focus:border-primary focus:outline-none"
            >
              <option value="Common">Comum</option>
              <option value="Uncommon">Incomum</option>
              <option value="Rare">Raro</option>
              <option value="Very Rare">Muito Raro</option>
              <option value="Legendary">Lendário</option>
              <option value="Artifact">Artefato</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">URL da Imagem</label>
            <input
              name="image_url"
              type="url"
              value={formData.image_url || ''}
              onChange={handleChange}
              className="w-full p-2 rounded bg-background border border-gray-600 focus:border-primary focus:outline-none"
              placeholder="https://game-icons.net/icons/ffffff/000000/1x1/lorc/sword.svg"
            />
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Preço (moedas)</label>
            <input
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 rounded bg-background border border-gray-600 focus:border-primary focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Descrição</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 rounded bg-background border border-gray-600 focus:border-primary focus:outline-none resize-none"
              placeholder="Descreva as propriedades e aparência do item..."
            ></textarea>
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-background font-bold py-2 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Forjando...' : 'Forjar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}