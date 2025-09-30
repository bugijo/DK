import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemById, updateItem, deleteItem, ItemData, ItemUpdateData } from '../services/api';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ItemUpdateData>({});

  useEffect(() => {
    if (!id) return;
    getItemById(id).then(data => {
      setItem(data);
      setFormData({
        description: data.description,
        type: data.type,
        rarity: data.rarity,
        image_url: data.image_url,
        price: data.price,
      });
    }).catch(console.error);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const updatedItem = await updateItem(id, formData);
      setItem(updatedItem);
      setIsEditing(false); // Sai do modo de edição
    } catch (error) {
      console.error("Erro ao atualizar o item:", error);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm(`Tem certeza que deseja deletar o item "${item?.name}"? Esta ação é irreversível.`)) return;
    try {
      await deleteItem(id);
      navigate('/tools/items'); // Volta para a lista de itens
    } catch (error) {
      console.error("Erro ao deletar o item:", error);
    }
  };

  if (!item) return <div>Carregando item...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface/80 p-8 rounded-lg shadow-lg border border-secondary/30">
      {!isEditing ? (
        // --- MODO DE VISUALIZAÇÃO ---
        <div>
          <h2 className="font-title text-3xl text-primary">{item.name}</h2>
          <p className="text-text-muted mb-4">{item.rarity} {item.type}</p>
          <p className="font-body text-text-base">{item.description}</p>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setIsEditing(true)} className="bg-primary text-background font-bold py-2 px-6 rounded-lg">Editar</button>
            <button onClick={handleDelete} className="bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Deletar</button>
          </div>
        </div>
      ) : (
        // --- MODO DE EDIÇÃO ---
        <form onSubmit={handleUpdate} className="space-y-4">
          <h2 className="font-title text-3xl text-primary mb-4">Editando: {item.name}</h2>
          
          <div>
            <label className="block text-text-muted text-sm mb-1">Descrição</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={5} className="w-full p-2 rounded bg-background border border-gray-600"></textarea>
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Tipo</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 rounded bg-background border border-gray-600">
                <option>Mundane</option><option>Weapon</option><option>Armor</option><option>Potion</option><option>Scroll</option><option>Magical</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Raridade</label>
            <select name="rarity" value={formData.rarity} onChange={handleChange} className="w-full p-2 rounded bg-background border border-gray-600">
                <option>Common</option><option>Uncommon</option><option>Rare</option><option>Very Rare</option><option>Legendary</option><option>Artifact</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">URL da Imagem</label>
            <input name="image_url" type="url" value={formData.image_url || ''} onChange={handleChange} placeholder="https://example.com/image.svg" className="w-full p-2 rounded bg-background border border-gray-600" />
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Preço (moedas)</label>
            <input name="price" type="number" value={formData.price || 0} onChange={handleChange} min="0" className="w-full p-2 rounded bg-background border border-gray-600" />
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg">Salvar Alterações</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}