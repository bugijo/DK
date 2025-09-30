import React, { useState, useEffect } from 'react';
import { createTable, TableData, getUserStories, StoryData } from '../services/api';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCreated: () => void; // Função para avisar o pai que uma mesa foi criada
}

export function CreateTableModal({ isOpen, onClose, onTableCreated }: CreateTableModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxPlayers: 4,
    date: '',
    time: '',
    type: 'online',
    isPrivate: false,
    system: 'D&D 5e',
    master_id: '1', // Será implementado quando houver autenticação
  });

  const [stories, setStories] = useState<StoryData[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getUserStories().then(setStories).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[MODAL] ⚡ INÍCIO DO HANDLESUBMIT - Evento recebido:', e.type);
    e.preventDefault(); // ESTA É A LINHA CRÍTICA
    e.stopPropagation(); // Impede propagação do evento
    console.log('[MODAL] ✅ preventDefault() e stopPropagation() executados');
    setError(null);
    console.log('[MODAL] Formulário submetido. Tentando criar a mesa...');

    if (!selectedStoryId) {
      setError('Por favor, selecione uma história para a mesa.');
      return;
    }

    try {
      const newTableData = {
        ...formData,
        story_id: selectedStoryId,
        master_id: '1', // Substituir no futuro
        system: 'D&D 5e',
      };
      
      console.log('[MODAL] Chamando a API com os seguintes dados:', newTableData);
      await createTable(newTableData as any);
      
      console.log('%c[MODAL] SUCESSO! A API criou a mesa. Chamando onTableCreated...', 'color: lightgreen; font-weight: bold;');
      onTableCreated();
      
      onClose();
    } catch (error) {
      console.error('%c[MODAL] ERRO! A chamada da API falhou.', 'color: red; font-weight: bold;', error);
      setError("Ocorreu um erro ao criar a mesa. Verifique o console para detalhes.");
    }
  };



  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="
        bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900
        border-2 border-amber-600/50 rounded-lg shadow-2xl
        w-full max-w-md max-h-[90vh] overflow-y-auto
      " onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-amber-600/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-amber-100 font-cinzel">
              Criar Nova Mesa
            </h2>
            <button
              onClick={onClose}
              className="
                text-stone-400 hover:text-amber-100 transition-colors
                text-2xl font-bold w-8 h-8 flex items-center justify-center
                hover:bg-stone-700/50 rounded-full
              "
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* História Base */}
            <div className="col-span-2">
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                História Base *
              </label>
              <select
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
                required
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors
                "
              >
                <option value="" disabled>Selecione uma história</option>
                {stories.map(story => (
                  <option key={story.id} value={story.id}>{story.title}</option>
                ))}
              </select>
            </div>

            {/* Nome da Mesa */}
            <div className="col-span-2">
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Nome da Mesa *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100 placeholder-stone-400
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors
                "
                placeholder="Ex: A Vingança do Dragão Vermelho"
                maxLength={50}
              />
            </div>

            {/* Sistema */}
            <div>
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Sistema
              </label>
              <input
                type="text"
                value={formData.system}
                disabled
                className="
                  w-full px-3 py-2 bg-stone-700 border border-stone-600
                  rounded-md text-stone-400 cursor-not-allowed
                "
              />
            </div>

            {/* Número de Jogadores */}
            <div>
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Nº de Jogadores
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100 placeholder-stone-400
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors
                "
                placeholder="4"
                min="2"
                max="8"
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Data *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors
                "
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Hora *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors
                "
              />
            </div>

            {/* Tipo de Mesa */}
            <div className="col-span-2">
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Tipo de Mesa
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors
                "
              >
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>

            {/* Descrição */}
            <div className="col-span-2">
              <label className="block text-amber-100 text-sm font-semibold mb-2">
                Descrição *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 bg-stone-800 border border-stone-600
                  rounded-md text-stone-100 placeholder-stone-400
                  focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                  transition-colors resize-none
                "
                placeholder="Uma breve descrição da aventura..."
                rows={5}
                maxLength={500}
              />
            </div>

            {/* Mesa Privada */}
            <div className="col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="
                    w-4 h-4 text-amber-600 bg-stone-800 border-stone-600
                    rounded focus:ring-amber-500 focus:ring-2
                  "
                />
                <span className="text-amber-100 text-sm font-semibold">
                  Mesa Privada
                </span>
              </label>
              <p className="text-stone-400 text-xs mt-1">
                Mesas privadas requerem senha para entrar
              </p>
            </div>


          </div>

          {/* Error Message */}
          {error && (
            <div className="col-span-2 mt-4 p-3 bg-red-900/50 border border-red-600 rounded-md">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="col-span-2 mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg mr-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 font-bold py-2 px-6 rounded-lg"
            >
              Criar Mesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTableModal;