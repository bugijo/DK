import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCharacter, CharacterCreateData } from '../services/api';
import { useToastContext } from '../contexts/ToastContext';

export function CreateCharacterPage() {
  const [formData, setFormData] = useState<CharacterCreateData>({
    name: '',
    race: '',
    character_class: '',
    level: 1,
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value) || 1 : value
    }));
  };

  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 1;
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [name]: Math.max(1, Math.min(20, numValue))
      }
    }));
  };

  const rollAttribute = (attributeName: string) => {
    const roll = Math.floor(Math.random() * 15) + 6; // 6-20
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeName]: roll
      }
    }));
  };

  const rollAllAttributes = () => {
    const newAttributes = {
      strength: Math.floor(Math.random() * 15) + 6,
      dexterity: Math.floor(Math.random() * 15) + 6,
      constitution: Math.floor(Math.random() * 15) + 6,
      intelligence: Math.floor(Math.random() * 15) + 6,
      wisdom: Math.floor(Math.random() * 15) + 6,
      charisma: Math.floor(Math.random() * 15) + 6
    };
    setFormData(prev => ({ ...prev, attributes: newAttributes }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.race) {
      setError('Raça é obrigatória');
      return false;
    }
    if (!formData.character_class) {
      setError('Classe é obrigatória');
      return false;
    }
    if (formData.level < 1 || formData.level > 20) {
      setError('Nível deve estar entre 1 e 20');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await createCharacter(formData);
      showSuccess('Personagem criado', `${formData.name} foi criado com sucesso!`);
      navigate('/characters');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao criar personagem';
      setError(errorMessage);
      showError('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const races = [
    { value: 'Human', label: 'Humano', description: 'Versáteis e adaptáveis' },
    { value: 'Elf', label: 'Elfo', description: 'Graciosos e mágicos' },
    { value: 'Dwarf', label: 'Anão', description: 'Resistentes e determinados' },
    { value: 'Halfling', label: 'Halfling', description: 'Pequenos mas corajosos' },
    { value: 'Dragonborn', label: 'Draconato', description: 'Descendentes de dragões' },
    { value: 'Gnome', label: 'Gnomo', description: 'Curiosos e inventivos' },
    { value: 'Half-Elf', label: 'Meio-Elfo', description: 'Entre dois mundos' },
    { value: 'Half-Orc', label: 'Meio-Orc', description: 'Força e determinação' },
    { value: 'Tiefling', label: 'Tiefling', description: 'Marcados pelo inferno' }
  ];

  const classes = [
    { value: 'Barbarian', label: 'Bárbaro', description: 'Guerreiro selvagem' },
    { value: 'Bard', label: 'Bardo', description: 'Artista e aventureiro' },
    { value: 'Cleric', label: 'Clérigo', description: 'Servo divino' },
    { value: 'Druid', label: 'Druida', description: 'Guardião da natureza' },
    { value: 'Fighter', label: 'Guerreiro', description: 'Mestre em combate' },
    { value: 'Monk', label: 'Monge', description: 'Disciplina interior' },
    { value: 'Paladin', label: 'Paladino', description: 'Cavaleiro sagrado' },
    { value: 'Ranger', label: 'Patrulheiro', description: 'Explorador das terras selvagens' },
    { value: 'Rogue', label: 'Ladino', description: 'Especialista em furtividade' },
    { value: 'Sorcerer', label: 'Feiticeiro', description: 'Magia inata' },
    { value: 'Warlock', label: 'Bruxo', description: 'Poder através de pactos' },
    { value: 'Wizard', label: 'Mago', description: 'Estudioso da magia' }
  ];

  const attributes = [
    { key: 'strength', label: 'Força', description: 'Poder físico' },
    { key: 'dexterity', label: 'Destreza', description: 'Agilidade e reflexos' },
    { key: 'constitution', label: 'Constituição', description: 'Resistência e vitalidade' },
    { key: 'intelligence', label: 'Inteligência', description: 'Capacidade de raciocínio' },
    { key: 'wisdom', label: 'Sabedoria', description: 'Percepção e intuição' },
    { key: 'charisma', label: 'Carisma', description: 'Força de personalidade' }
  ];

  const getAttributeModifier = (value: number): string => {
    const modifier = Math.floor((value - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const totalPoints = Object.values(formData.attributes).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            <img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '32px', height: '32px', display: 'inline', marginRight: '12px'}} /> CRIAR NOVO HERÓI <img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '32px', height: '32px', display: 'inline', marginLeft: '12px'}} />
          </h1>
          <p className="text-gray-300 text-lg">
            Forje seu destino e embarque em aventuras épicas
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 m-6 rounded">
              <div className="flex items-center">
                <img src="/icons/Alerta-Aviso.png" alt="Aviso" style={{width: '20px', height: '20px', marginRight: '8px'}} />
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
                  <span className="mr-3">📜</span>
                  Informações Básicas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-gray-300 font-semibold mb-2">
                      Nome do Personagem
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                      placeholder="Ex: Aragorn, Legolas, Gandalf..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-300 font-semibold mb-2">
                      Nível
                    </label>
                    <input
                      type="number"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      required
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.name.trim()}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Race and Class */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
                  <span className="mr-3">🏰</span>
                  Raça e Classe
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Races */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-4">
                      Escolha sua Raça
                    </label>
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {races.map(race => (
                        <div
                          key={race.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.race === race.value
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, race: race.value }))}
                        >
                          <div className="font-semibold text-white">{race.label}</div>
                          <div className="text-sm text-gray-400">{race.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classes */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-4">
                      Escolha sua Classe
                    </label>
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {classes.map(charClass => (
                        <div
                          key={charClass.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.character_class === charClass.value
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, character_class: charClass.value }))}
                        >
                          <div className="font-semibold text-white">{charClass.label}</div>
                          <div className="text-sm text-gray-400">{charClass.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.race || !formData.character_class}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Attributes */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-yellow-400 flex items-center">
                    <span className="mr-3">⚡</span>
                    Atributos
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300">Total: {totalPoints}</span>
                    <button
                      type="button"
                      onClick={rollAllAttributes}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      <img src="/icons/Sistema de Dados.png" alt="Dados" style={{width: '20px', height: '20px', marginRight: '8px', display: 'inline'}} /> Rolar Todos
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attributes.map(attr => (
                    <div key={attr.key} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <label className="block text-white font-semibold">
                            {attr.label}
                          </label>
                          <p className="text-sm text-gray-400">{attr.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => rollAttribute(attr.key)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-all"
                          title="Rolar atributo"
                        >
                          <img src="/icons/Sistema de Dados.png" alt="Dados" style={{width: '16px', height: '16px'}} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          name={attr.key}
                          value={formData.attributes[attr.key as keyof typeof formData.attributes]}
                          onChange={handleAttributeChange}
                          min="1"
                          max="20"
                          className="w-20 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-center focus:outline-none focus:border-yellow-400"
                        />
                        <div className="flex-1">
                          <div className="text-lg font-bold text-yellow-400">
                            {getAttributeModifier(formData.attributes[attr.key as keyof typeof formData.attributes])}
                          </div>
                          <div className="text-xs text-gray-400">modificador</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                  >
                    ← Anterior
                  </button>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/characters')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '20px', height: '20px', marginRight: '8px'}} />
                          Forjar Herói
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}