import React, { useState } from 'react';
import { createNpc, NpcCreateData } from '../services/api';

interface CreateNpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNpcCreated: () => void;
}

export function CreateNpcModal({ isOpen, onClose, onNpcCreated }: CreateNpcModalProps) {
  const [formData, setFormData] = useState<NpcCreateData>({
    name: '',
    
    // Informações básicas
    race: 'Humano',
    character_class: 'Cidadão',
    level: 1,
    size: 'Medium',
    alignment: 'Neutro',
    armor_class: 10,
    hit_points: '4 (1d8)',
    speed: '30 ft.',
    
    // Atributos D&D 5e
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    
    // Proficiências e habilidades
    saving_throws: '',
    skills: '',
    damage_resistances: '',
    damage_immunities: '',
    condition_immunities: '',
    senses: '',
    languages: 'Common',
    
    // Personalidade e interpretação
    personality_traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    
    // Habilidades e ações
    special_abilities: '',
    actions: '',
    reactions: '',
    equipment: [],
    
    // Informações narrativas
    description: '',
    backstory: '',
    role: 'Cidadão',
    location: '',
    faction: '',
    
    // Informações de jogo
    challenge_rating: '0',
    experience_points: 0,
    proficiency_bonus: '',
    
    // Notas do mestre
    notes: '',
    quest_hooks: '',
    adventure_hooks: '',
    relationships: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['level', 'armor_class', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'experience_points'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createNpc(formData);
      onNpcCreated();
      onClose();
      // Reset form
      setFormData({
        name: '',
        
        // Informações básicas
        race: 'Humano',
        character_class: 'Cidadão',
        level: 1,
        size: 'Medium',
        alignment: 'Neutro',
        armor_class: 10,
        hit_points: '4 (1d8)',
        speed: '30 ft.',
        
        // Atributos D&D 5e
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        
        // Proficiências e habilidades
        saving_throws: '',
        skills: '',
        damage_resistances: '',
        damage_immunities: '',
        condition_immunities: '',
        senses: '',
        languages: 'Common',
        
        // Personalidade e interpretação
        personality_traits: '',
        ideals: '',
        bonds: '',
        flaws: '',
        
        // Habilidades e ações
        special_abilities: '',
        actions: '',
        reactions: '',
        equipment: [],
        
        // Informações narrativas
        description: '',
        backstory: '',
        role: 'Cidadão',
        location: '',
        faction: '',
        
        // Informações de jogo
        challenge_rating: '0',
        experience_points: 0,
        proficiency_bonus: '',
        
        // Notas do mestre
        notes: '',
        quest_hooks: '',
        adventure_hooks: '',
        relationships: ''
      });
    } catch (err) {
      setError('Erro ao criar o NPC. Verifique os dados e tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-lg p-8 w-full max-w-2xl border border-secondary/50 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-title text-2xl text-primary mb-6">Criar Novo NPC</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-base mb-2">
              Nome do NPC *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Ex: Tobias, o Ferreiro"
            />
          </div>

          {/* === INFORMAÇÕES BÁSICAS === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raça */}
              <div>
                <label htmlFor="race" className="block text-sm font-medium text-text-base mb-2">
                  Raça
                </label>
                <input
                  type="text"
                  id="race"
                  name="race"
                  value={formData.race}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Humano, Elfo, Halfling"
                />
              </div>

              {/* Classe */}
              <div>
                <label htmlFor="character_class" className="block text-sm font-medium text-text-base mb-2">
                  Classe/Profissão
                </label>
                <input
                  type="text"
                  id="character_class"
                  name="character_class"
                  value={formData.character_class}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Guerreiro, Comerciante, Ladino"
                />
              </div>

              {/* Nível */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-text-base mb-2">
                  Nível
                </label>
                <input
                  type="number"
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Tamanho */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-text-base mb-2">
                  Tamanho
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="Tiny">Minúsculo</option>
                  <option value="Small">Pequeno</option>
                  <option value="Medium">Médio</option>
                  <option value="Large">Grande</option>
                  <option value="Huge">Enorme</option>
                  <option value="Gargantuan">Colossal</option>
                </select>
              </div>

              {/* Tendência */}
              <div>
                <label htmlFor="alignment" className="block text-sm font-medium text-text-base mb-2">
                  Tendência
                </label>
                <input
                  type="text"
                  id="alignment"
                  name="alignment"
                  value={formData.alignment || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Leal e Bom, Caótico Neutro"
                />
              </div>

              {/* Função/Papel */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-text-base mb-2">
                  Função/Papel
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="Cidadão">Cidadão</option>
                  <option value="Comerciante">Comerciante</option>
                  <option value="Ferreiro">Ferreiro</option>
                  <option value="Guarda">Guarda</option>
                  <option value="Nobre">Nobre</option>
                  <option value="Sacerdote">Sacerdote</option>
                  <option value="Tavarneiro">Tavarneiro</option>
                  <option value="Mago">Mago</option>
                  <option value="Ladino">Ladino</option>
                  <option value="Vilão">Vilão</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Informante">Informante</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* === ESTATÍSTICAS DE COMBATE === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Estatísticas de Combate</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Classe de Armadura */}
              <div>
                <label htmlFor="armor_class" className="block text-sm font-medium text-text-base mb-2">
                  Classe de Armadura
                </label>
                <input
                  type="number"
                  id="armor_class"
                  name="armor_class"
                  value={formData.armor_class}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Pontos de Vida */}
              <div>
                <label htmlFor="hit_points" className="block text-sm font-medium text-text-base mb-2">
                  Pontos de Vida
                </label>
                <input
                  type="text"
                  id="hit_points"
                  name="hit_points"
                  value={formData.hit_points}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: 22 (4d8 + 4)"
                />
              </div>

              {/* Velocidade */}
              <div>
                <label htmlFor="speed" className="block text-sm font-medium text-text-base mb-2">
                  Velocidade
                </label>
                <input
                  type="text"
                  id="speed"
                  name="speed"
                  value={formData.speed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: 30 ft., fly 60 ft."
                />
              </div>
            </div>
          </div>

          {/* === ATRIBUTOS === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Atributos</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Força */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Destreza */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Constituição */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Inteligência */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Sabedoria */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Carisma */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* === PROFICIÊNCIAS E HABILIDADES === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Proficiências e Habilidades</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Testes de Resistência */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Dex +3, Wis +2"
                />
              </div>

              {/* Perícias */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Perception +4, Persuasion +5"
                />
              </div>

              {/* Sentidos */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Darkvision 60 ft., passive Perception 14"
                />
              </div>

              {/* Idiomas */}
              <div>
                <label htmlFor="languages" className="block text-sm font-medium text-text-base mb-2">
                  Idiomas
                </label>
                <input
                  type="text"
                  id="languages"
                  name="languages"
                  value={formData.languages || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Common, Elvish"
                />
              </div>
            </div>
          </div>

          {/* === PERSONALIDADE === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Personalidade e Interpretação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Traços de Personalidade */}
              <div>
                <label htmlFor="personality_traits" className="block text-sm font-medium text-text-base mb-2">
                  Traços de Personalidade
                </label>
                <textarea
                  id="personality_traits"
                  name="personality_traits"
                  value={formData.personality_traits || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Como o NPC se comporta e interage..."
                />
              </div>

              {/* Ideais */}
              <div>
                <label htmlFor="ideals" className="block text-sm font-medium text-text-base mb-2">
                  Ideais e Motivações
                </label>
                <textarea
                  id="ideals"
                  name="ideals"
                  value={formData.ideals || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="O que motiva e inspira o NPC..."
                />
              </div>

              {/* Vínculos */}
              <div>
                <label htmlFor="bonds" className="block text-sm font-medium text-text-base mb-2">
                  Vínculos
                </label>
                <textarea
                  id="bonds"
                  name="bonds"
                  value={formData.bonds || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Pessoas, lugares ou coisas importantes..."
                />
              </div>

              {/* Defeitos */}
              <div>
                <label htmlFor="flaws" className="block text-sm font-medium text-text-base mb-2">
                  Defeitos
                </label>
                <textarea
                  id="flaws"
                  name="flaws"
                  value={formData.flaws || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Fraquezas, vícios ou medos..."
                />
              </div>
            </div>
          </div>

          {/* === INFORMAÇÕES NARRATIVAS === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Informações Narrativas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Localização */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-text-base mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Taverna do Pônei Saltitante"
                />
              </div>

              {/* Facção */}
              <div>
                <label htmlFor="faction" className="block text-sm font-medium text-text-base mb-2">
                  Facção/Organização
                </label>
                <input
                  type="text"
                  id="faction"
                  name="faction"
                  value={formData.faction || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: Guarda da Cidade, Thieves' Guild"
                />
              </div>
            </div>
            
            {/* História Pessoal */}
            <div className="mt-4">
              <label htmlFor="backstory" className="block text-sm font-medium text-text-base mb-2">
                História Pessoal
              </label>
              <textarea
                id="backstory"
                name="backstory"
                value={formData.backstory || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                placeholder="A história de vida do NPC, eventos importantes, como chegou à posição atual..."
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-base mb-2">
              Descrição Física
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
              placeholder="Descreva a aparência física, vestimentas e características marcantes do NPC..."
            />
          </div>

          {/* === HABILIDADES E AÇÕES === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Habilidades e Ações</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Habilidades Especiais */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Magias, habilidades de classe, talentos especiais..."
                />
              </div>

              {/* Ações */}
              <div>
                <label htmlFor="actions" className="block text-sm font-medium text-text-base mb-2">
                  Ações de Combate
                </label>
                <textarea
                  id="actions"
                  name="actions"
                  value={formData.actions || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Ataques, magias e outras ações que o NPC pode realizar em combate..."
                />
              </div>

              {/* Equipamentos */}
              <div>
                <label htmlFor="equipment" className="block text-sm font-medium text-text-base mb-2">
                  Equipamentos
                </label>
                <textarea
                  id="equipment"
                  name="equipment"
                  value={formData.equipment || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Armas, armaduras, itens mágicos e outros equipamentos..."
                />
              </div>
            </div>
          </div>

          {/* === INFORMAÇÕES DE JOGO === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Informações de Jogo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nível de Desafio */}
              <div>
                <label htmlFor="challenge_rating" className="block text-sm font-medium text-text-base mb-2">
                  Nível de Desafio (CR)
                </label>
                <input
                  type="text"
                  id="challenge_rating"
                  name="challenge_rating"
                  value={formData.challenge_rating || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Ex: 1/4, 1, 5"
                />
              </div>

              {/* Pontos de Experiência */}
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
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="XP concedido ao derrotar"
                />
              </div>
            </div>

            {/* Bônus de Proficiência */}
            <div className="mt-4">
              <label htmlFor="proficiency_bonus" className="block text-sm font-medium text-text-base mb-2">
                Bônus de Proficiência
              </label>
              <input
                type="text"
                id="proficiency_bonus"
                name="proficiency_bonus"
                value={formData.proficiency_bonus || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Ex: +2, +3, +4"
              />
            </div>
          </div>

          {/* === NOTAS DO MESTRE === */}
          <div className="border-t border-secondary/30 pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Notas do Mestre</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Notas Secretas */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-base mb-2">
                  Notas Secretas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                  placeholder="Informações que apenas o Mestre deve saber sobre este NPC..."
                />
              </div>

              {/* Ganchos de Aventura */}
               <div>
                 <label htmlFor="adventure_hooks" className="block text-sm font-medium text-text-base mb-2">
                   Ganchos de Aventura
                 </label>
                 <textarea
                   id="adventure_hooks"
                   name="adventure_hooks"
                   value={formData.adventure_hooks || ''}
                   onChange={handleChange}
                   rows={3}
                   className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                   placeholder="Como este NPC pode ser usado para criar aventuras ou missões..."
                 />
               </div>

               {/* Relacionamentos */}
               <div>
                 <label htmlFor="relationships" className="block text-sm font-medium text-text-base mb-2">
                   Relacionamentos
                 </label>
                 <textarea
                   id="relationships"
                   name="relationships"
                   value={formData.relationships || ''}
                   onChange={handleChange}
                   rows={3}
                   className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-lg text-text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                   placeholder="Conexões com outros NPCs, organizações ou personagens dos jogadores..."
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
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-background font-bold py-2 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Criando...' : 'Criar NPC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}