import React, { useState, useEffect } from 'react';
import { getUserCharacters, createCharacter, updateCharacter, deleteCharacter } from '../services/api';
import './Characters.css';

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    character_class: '',
    level: 1,
    background: '',
    alignment: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    hit_points: 8,
    max_hit_points: 8,
    armor_class: 10,
    backstory: '',
    personality_traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    equipment: [],
    notes: ''
  });



  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const data = await getUserCharacters();
      setCharacters(data);
    } catch (error) {
      console.error('Erro ao buscar personagens:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharacter) {
        const characterData = {
          name: formData.name,
          race: formData.race,
          character_class: formData.character_class,
          level: formData.level,
          attributes: {
            strength: formData.strength,
            dexterity: formData.dexterity,
            constitution: formData.constitution,
            intelligence: formData.intelligence,
            wisdom: formData.wisdom,
            charisma: formData.charisma
          }
        };
        await updateCharacter(editingCharacter.id, characterData);
      } else {
        const characterData = {
          name: formData.name,
          race: formData.race,
          character_class: formData.character_class,
          level: formData.level,
          attributes: {
            strength: formData.strength,
            dexterity: formData.dexterity,
            constitution: formData.constitution,
            intelligence: formData.intelligence,
            wisdom: formData.wisdom,
            charisma: formData.charisma
          }
        };
        await createCharacter(characterData);
      }
      fetchCharacters();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este personagem?')) {
      try {
        await deleteCharacter(id);
        fetchCharacters();
      } catch (error) {
        console.error('Erro ao deletar personagem:', error);
      }
    }
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setFormData({ ...character });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      race: '',
      character_class: '',
      level: 1,
      background: '',
      alignment: '',
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      hit_points: 8,
      max_hit_points: 8,
      armor_class: 10,
      backstory: '',
      personality_traits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      equipment: [],
      notes: ''
    });
    setEditingCharacter(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('level') || name.includes('strength') || name.includes('dexterity') || 
              name.includes('constitution') || name.includes('intelligence') || name.includes('wisdom') || 
              name.includes('charisma') || name.includes('hit_points') || name.includes('max_hit_points') || 
              name.includes('armor_class') ? parseInt(value) || 0 : value
    }));
  };

  const getModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="characters-container">
      <div className="characters-header">
        <h2><img src="/icons/Personagem-Máscara.png" alt="Personagem" style={{width: '24px', height: '24px', marginRight: '8px'}} /> Coração do Aventureiro</h2>
        <p>Gerencie seus heróis e suas jornadas épicas</p>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '20px', height: '20px', marginRight: '8px'}} /> Criar Novo Personagem
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="character-form-modal">
            <div className="modal-header">
              <h3>{editingCharacter ? <><img src="/icons/Editar.png" alt="Editar" style={{width: '20px', height: '20px', marginRight: '8px'}} /> Editar Personagem</> : <><img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '20px', height: '20px', marginRight: '8px'}} /> Criar Novo Personagem</>}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="character-form">
              <div className="form-tabs">
                <div className="tab-content">
                  {/* Informações Básicas */}
                  <div className="form-section">
                    <h4><img src="/icons/Anotações Rápidas.png" alt="Anotações" style={{width: '20px', height: '20px', marginRight: '8px'}} /> Informações Básicas</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nome do Personagem</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Raça</label>
                        <input
                          type="text"
                          name="race"
                          value={formData.race}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Classe</label>
                        <input
                          type="text"
                          name="character_class"
                          value={formData.character_class}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Nível</label>
                        <input
                          type="number"
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          min="1"
                          max="20"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Antecedente</label>
                        <input
                          type="text"
                          name="background"
                          value={formData.background}
                          onChange={handleInputChange}
                          placeholder="Ex: Soldado, Erudito, Criminoso"
                        />
                      </div>
                      <div className="form-group">
                        <label>Tendência</label>
                        <input
                          type="text"
                          name="alignment"
                          value={formData.alignment}
                          onChange={handleInputChange}
                          placeholder="Ex: Leal e Bom, Caótico Neutro"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Atributos */}
                  <div className="form-section">
                    <h4>💪 Atributos</h4>
                    <div className="attributes-grid">
                      {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(attr => (
                        <div key={attr} className="attribute-group">
                          <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                          <input
                            type="number"
                            name={attr}
                            value={formData[attr]}
                            onChange={handleInputChange}
                            min="1"
                            max="20"
                          />
                          <span className="modifier">{formatModifier(getModifier(formData[attr]))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Combate */}
                  <div className="form-section">
                    <h4><img src="/icons/Equipamentos.png" alt="Combate" style={{width: '20px', height: '20px', display: 'inline', marginRight: '8px'}} />Estatísticas de Combate</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Pontos de Vida Atuais</label>
                        <input
                          type="number"
                          name="hit_points"
                          value={formData.hit_points}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Pontos de Vida Máximos</label>
                        <input
                          type="number"
                          name="max_hit_points"
                          value={formData.max_hit_points}
                          onChange={handleInputChange}
                          min="1"
                        />
                      </div>
                      <div className="form-group">
                        <label>Classe de Armadura</label>
                        <input
                          type="number"
                          name="armor_class"
                          value={formData.armor_class}
                          onChange={handleInputChange}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* História */}
                  <div className="form-section">
                    <h4>📖 História e Personalidade</h4>
                    <div className="form-group">
                      <label>História Pessoal</label>
                      <textarea
                        name="backstory"
                        value={formData.backstory}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Conte a história do seu personagem..."
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Traços de Personalidade</label>
                        <textarea
                          name="personality_traits"
                          value={formData.personality_traits}
                          onChange={handleInputChange}
                          rows="2"
                        />
                      </div>
                      <div className="form-group">
                        <label>Ideais</label>
                        <textarea
                          name="ideals"
                          value={formData.ideals}
                          onChange={handleInputChange}
                          rows="2"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Vínculos</label>
                        <textarea
                          name="bonds"
                          value={formData.bonds}
                          onChange={handleInputChange}
                          rows="2"
                        />
                      </div>
                      <div className="form-group">
                        <label>Defeitos</label>
                        <textarea
                          name="flaws"
                          value={formData.flaws}
                          onChange={handleInputChange}
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  <div className="form-section">
                    <h4>📝 Notas Adicionais</h4>
                    <div className="form-group">
                      <label>Notas</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Anotações sobre o personagem..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCharacter ? 'Atualizar' : 'Criar'} Personagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="characters-grid">
        {characters.map(character => (
          <div key={character.id} className="character-card">
            <div className="character-header">
              <h3>{character.name}</h3>
              <div className="character-level">Nível {character.level}</div>
            </div>
            
            <div className="character-info">
              <p><strong>Raça:</strong> {character.race}</p>
              <p><strong>Classe:</strong> {character.character_class}</p>
              {character.background && <p><strong>Antecedente:</strong> {character.background}</p>}
              {character.alignment && <p><strong>Tendência:</strong> {character.alignment}</p>}
            </div>
            
            <div className="character-stats">
              <div className="stat-group">
                <span className="stat-label">PV:</span>
                <span className="stat-value">{character.hit_points}/{character.max_hit_points}</span>
              </div>
              <div className="stat-group">
                <span className="stat-label">CA:</span>
                <span className="stat-value">{character.armor_class}</span>
              </div>
            </div>
            
            <div className="character-attributes">
              <div className="attr-row">
                <div className="attr">FOR: {character.strength} ({formatModifier(getModifier(character.strength))})</div>
                <div className="attr">DES: {character.dexterity} ({formatModifier(getModifier(character.dexterity))})</div>
                <div className="attr">CON: {character.constitution} ({formatModifier(getModifier(character.constitution))})</div>
              </div>
              <div className="attr-row">
                <div className="attr">INT: {character.intelligence} ({formatModifier(getModifier(character.intelligence))})</div>
                <div className="attr">SAB: {character.wisdom} ({formatModifier(getModifier(character.wisdom))})</div>
                <div className="attr">CAR: {character.charisma} ({formatModifier(getModifier(character.charisma))})</div>
              </div>
            </div>
            
            {character.backstory && (
              <div className="character-backstory">
                <p><strong>História:</strong> {character.backstory.substring(0, 100)}{character.backstory.length > 100 ? '...' : ''}</p>
              </div>
            )}
            
            <div className="character-actions">
              <button 
                className="btn-edit"
                onClick={() => handleEdit(character)}
              >
                <img src="/icons/Editar.png" alt="Editar" style={{width: '16px', height: '16px', marginRight: '4px'}} /> Editar
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDelete(character.id)}
              >
                <img src="/icons/Deletar.png" alt="Deletar" style={{width: '16px', height: '16px', marginRight: '4px'}} /> Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {characters.length === 0 && (
        <div className="empty-state">
          <h3><img src="/icons/Personagem-Máscara.png" alt="Personagem" style={{width: '24px', height: '24px', marginRight: '8px'}} /> Nenhum personagem criado ainda</h3>
          <p>Comece sua jornada criando seu primeiro herói!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '20px', height: '20px', marginRight: '8px'}} /> Criar Primeiro Personagem
          </button>
        </div>
      )}
    </div>
  );
};

export default Characters;