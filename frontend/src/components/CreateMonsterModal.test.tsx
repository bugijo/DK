import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateMonsterModal } from './CreateMonsterModal';
import { createMonster } from '../services/api';

// Mock da API
jest.mock('../services/api', () => ({
  createMonster: jest.fn(),
}));

const mockCreateMonster = createMonster as jest.MockedFunction<typeof createMonster>;

describe('CreateMonsterModal', () => {
  const mockOnClose = jest.fn();
  const mockOnMonsterCreated = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onMonsterCreated: mockOnMonsterCreated,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateMonster.mockResolvedValue({
      id: '1',
      name: 'Dragão Vermelho',
      size: 'Gargantuan',
      type: 'Dragon',
      armor_class: 19,
      hit_points: '256 (19d20+57)',
      speed: '40 ft., climb 40 ft., fly 80 ft.',
      challenge_rating: '17',
      experience_points: 18000,
      strength: 27,
      dexterity: 10,
      constitution: 25,
      intelligence: 16,
      wisdom: 13,
      charisma: 21,
      saving_throws: 'Dex +6, Con +13, Wis +7, Cha +11',
      skills: 'Perception +13, Stealth +6',
      damage_resistances: '',
      damage_immunities: 'Fire',
      condition_immunities: '',
      senses: 'Blindsight 60 ft., Darkvision 120 ft., passive Perception 23',
      languages: 'Common, Draconic',
      special_abilities: 'Legendary Resistance (3/Day)',
      actions: 'Multiattack, Bite, Claw, Fire Breath',
      legendary_actions: 'Detect, Tail Attack, Wing Attack',
      reactions: '',
      environment: 'Mountains',
      description: 'Um poderoso dragão vermelho ancião.',
      creator_id: 'user1',
    });
  });

  it('deve renderizar o modal quando isOpen for true', () => {
    render(<CreateMonsterModal {...defaultProps} />);
    
    expect(screen.getByText('Conjurar Nova Criatura')).toBeInTheDocument();
  });

  it('não deve renderizar o modal quando isOpen for false', () => {
    render(<CreateMonsterModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Conjurar Nova Criatura')).not.toBeInTheDocument();
  });

  it('deve renderizar botões do formulário', () => {
    render(<CreateMonsterModal {...defaultProps} />);
    
    expect(screen.getByText('Conjurar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve chamar onClose quando o botão Cancelar for clicado', () => {
    render(<CreateMonsterModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });


});