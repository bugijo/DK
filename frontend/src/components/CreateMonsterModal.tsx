import React, { useState } from 'react';
import { createMonster, MonsterCreateData } from '../services/api';

interface CreateMonsterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMonsterCreated: () => void;
}

export function CreateMonsterModal({ isOpen, onClose, onMonsterCreated }: CreateMonsterModalProps) {
  const [formData, setFormData] = useState<MonsterCreateData>({
    name: '',
    size: 'Medium',
    type: 'Beast',
    armor_class: 10,
    hit_points: '10 (2d8+2)',
    speed: '30 ft.',
    
    // Atributos D&D 5e
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    
    // Proficiências e resistências
    saving_throws: '',
    skills: '',
    damage_resistances: '',
    damage_immunities: '',
    condition_immunities: '',
    senses: '',
    languages: '',
    
    // Habilidades e ações
    special_abilities: '',
    actions: '',
    legendary_actions: '',
    reactions: '',
    
    challenge_rating: '1/4',
    experience_points: 50,
    
    // Informações adicionais
    description: '',
    environment: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['armor_class', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'experience_points'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await createMonster(formData);
      onMonsterCreated();
      onClose();
      // Reset form
      setFormData({
        name: '',
        size: 'Medium',
        type: 'Beast',
        armor_class: 10,
        hit_points: '10 (2d8+2)',
        speed: '30 ft.',
        
        // Atributos D&D 5e
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        
        // Proficiências e resistências
        saving_throws: '',
        skills: '',
        damage_resistances: '',
        damage_immunities: '',
        condition_immunities: '',
        senses: '',
        languages: '',
        
        // Habilidades e ações
        special_abilities: '',
        actions: '',
        legendary_actions: '',
        reactions: '',
        
        challenge_rating: '1/4',
        experience_points: 50,
        
        // Informações adicionais
        description: '',
        environment: ''
      });
    } catch (err) {
      setError("Erro ao criar a criatura. Verifique os dados e tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const sizeOptions = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  const challengeRatingOptions = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-lg p-8 w-full max-w-2xl border border-secondary/50 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-title text-2xl text-primary mb-6">Conjurar Nova Criatura</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-base mb-2">
              Nome da Criatura *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Ex: Lobo Sombrio"
            />
          </div>

          {/* Tamanho e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-text-base mb-2">
                Tamanho *
              </label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {sizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-text-base mb-2">
                Tipo *
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Ex: Beast, Humanoid, Undead"
              />
            </div>
          </div>

          {/* Classe de Armadura e Nível de Desafio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="armor_class" className="block text-sm font-medium text-text-base mb-2">
                Classe de Armadura *
              </label>
              <input
                type="number"
                id="armor_class"
                name="armor_class"
                value={formData.armor_class}
                onChange={handleChange}
                required
                min="1"
                max="30"
                className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="challenge_rating" className="block text-sm font-medium text-text-base mb-2">
                Nível de Desafio *
              </label>
              <select
                id="challenge_rating"
                name="challenge_rating"
                value={formData.challenge_rating}
                onChange={handleChange}
                required
                className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {challengeRatingOptions.map(cr => (
                  <option key={cr} value={cr}>ND {cr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pontos de Vida */}
          <div>
            <label htmlFor="hit_points" className="block text-sm font-medium text-text-base mb-2">
              Pontos de Vida *
            </label>
            <input
              type="text"
              id="hit_points"
              name="hit_points"
              value={formData.hit_points}
              onChange={handleChange}
              required
              className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Ex: 58 (9d10 + 9)"
            />
          </div>

          {/* Velocidade */}
          <div>
            <label htmlFor="speed" className="block text-sm font-medium text-text-base mb-2">
              Velocidade *
            </label>
            <input
              type="text"
              id="speed"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              required
              className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Ex: 40 ft., fly 80 ft."
            />
          </div>

          {/* Atributos D&D 5e */}
          <div className="border-t border-secondary/30 pt-4">
            <h3 className="font-title text-lg text-primary mb-4">Atributos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="strength" className="block text-sm font-medium text-text-base mb-2">
                  Força
                </label>
                <input
                  type="number"
                  id="strength"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="dexterity" className="block text-sm font-medium text-text-base mb-2">
                  Destreza
                </label>
                <input
                  type="number"
                  id="dexterity"
                  name="dexterity"
                  value={formData.dexterity}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="constitution" className="block text-sm font-medium text-text-base mb-2">
                  Constituição
                </label>
                <input
                  type="number"
                  id="constitution"
                  name="constitution"
                  value={formData.constitution}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="intelligence" className="block text-sm font-medium text-text-base mb-2">
                  Inteligência
                </label>
                <input
                  type="number"
                  id="intelligence"
                  name="intelligence"
                  value={formData.intelligence}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="wisdom" className="block text-sm font-medium text-text-base mb-2">
                  Sabedoria
                </label>
                <input
                  type="number"
                  id="wisdom"
                  name="wisdom"
                  value={formData.wisdom}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="charisma" className="block text-sm font-medium text-text-base mb-2">
                  Carisma
                </label>
                <input
                  type="number"
                  id="charisma"
                  name="charisma"
                  value={formData.charisma}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Proficiências e Resistências */}
          <div className="border-t border-secondary/30 pt-4">
            <h3 className="font-title text-lg text-primary mb-4">Proficiências e Resistências</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="saving_throws" className="block text-sm font-medium text-text-base mb-2">
                  Testes de Resistência
                </label>
                <input
                  type="text"
                  id="saving_throws"
                  name="saving_throws"
                  value={formData.saving_throws || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Dex +3, Wis +2"
                />
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-text-base mb-2">
                  Perícias
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Perception +4, Stealth +5"
                />
              </div>
              <div>
                <label htmlFor="damage_resistances" className="block text-sm font-medium text-text-base mb-2">
                  Resistências a Dano
                </label>
                <input
                  type="text"
                  id="damage_resistances"
                  name="damage_resistances"
                  value={formData.damage_resistances || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Fire, Cold"
                />
              </div>
              <div>
                <label htmlFor="damage_immunities" className="block text-sm font-medium text-text-base mb-2">
                  Imunidades a Dano
                </label>
                <input
                  type="text"
                  id="damage_immunities"
                  name="damage_immunities"
                  value={formData.damage_immunities || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Poison, Necrotic"
                />
              </div>
              <div>
                <label htmlFor="condition_immunities" className="block text-sm font-medium text-text-base mb-2">
                  Imunidades a Condições
                </label>
                <input
                  type="text"
                  id="condition_immunities"
                  name="condition_immunities"
                  value={formData.condition_immunities || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Charmed, Frightened"
                />
              </div>
              <div>
                <label htmlFor="senses" className="block text-sm font-medium text-text-base mb-2">
                  Sentidos
                </label>
                <input
                  type="text"
                  id="senses"
                  name="senses"
                  value={formData.senses || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Darkvision 60 ft., passive Perception 14"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="languages" className="block text-sm font-medium text-text-base mb-2">
                Idiomas
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                value={formData.languages || ''}
                onChange={handleChange}
                className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Ex: Common, Draconic"
              />
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-t border-secondary/30 pt-4">
            <h3 className="font-title text-lg text-primary mb-4">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="environment" className="block text-sm font-medium text-text-base mb-2">
                  Ambiente
                </label>
                <input
                  type="text"
                  id="environment"
                  name="environment"
                  value={formData.environment || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Forest, Swamp, Underground"
                />
              </div>
              <div>
                <label htmlFor="experience_points" className="block text-sm font-medium text-text-base mb-2">
                  Pontos de Experiência
                </label>
                <input
                  type="number"
                  id="experience_points"
                  name="experience_points"
                  value={formData.experience_points}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-text-base mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                placeholder="Descreva a aparência e lore da criatura..."
              />
            </div>
          </div>

          {/* Habilidades e Ações */}
          <div className="border-t border-secondary/30 pt-4">
            <h3 className="font-title text-lg text-primary mb-4">Habilidades e Ações</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="special_abilities" className="block text-sm font-medium text-text-base mb-2">
                  Habilidades Especiais
                </label>
                <textarea
                  id="special_abilities"
                  name="special_abilities"
                  value={formData.special_abilities || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Descreva as habilidades especiais da criatura..."
                />
              </div>
              <div>
                <label htmlFor="actions" className="block text-sm font-medium text-text-base mb-2">
                  Ações
                </label>
                <textarea
                  id="actions"
                  name="actions"
                  value={formData.actions || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Descreva as ações de combate da criatura..."
                />
              </div>
              <div>
                <label htmlFor="legendary_actions" className="block text-sm font-medium text-text-base mb-2">
                  Ações Lendárias
                </label>
                <textarea
                  id="legendary_actions"
                  name="legendary_actions"
                  value={formData.legendary_actions || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Descreva as ações lendárias da criatura..."
                />
              </div>
              <div>
                <label htmlFor="reactions" className="block text-sm font-medium text-text-base mb-2">
                  Reações
                </label>
                <textarea
                  id="reactions"
                  name="reactions"
                  value={formData.reactions || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 bg-background/50 border border-secondary/30 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Descreva as reações da criatura..."
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-background font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                  Conjurando...
                </>
              ) : (
                'Conjurar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}