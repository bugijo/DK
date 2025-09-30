import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateItemModal } from './CreateItemModal';
import * as api from '../services/api';

// Mock da API
jest.mock('../services/api', () => ({
  createItem: jest.fn()
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('CreateItemModal', () => {
  const mockOnClose = jest.fn();
  const mockOnItemCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (isOpen = true) => {
    return render(
      <CreateItemModal
        isOpen={isOpen}
        onClose={mockOnClose}
        onItemCreated={mockOnItemCreated}
      />
    );
  };

  test('não renderiza quando isOpen é false', () => {
    renderModal(false);
    expect(screen.queryByText('Forjar Novo Item')).not.toBeInTheDocument();
  });

  test('renderiza o modal corretamente quando isOpen é true', () => {
    renderModal();
    
    expect(screen.getByText('Forjar Novo Item')).toBeInTheDocument();
    expect(screen.getByText('Nome do Item')).toBeInTheDocument();
    expect(screen.getByText('Descrição')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Raridade')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forjar Item' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  test('renderiza sem falhas', () => {
    renderModal();
    expect(screen.getByText('Forjar Novo Item')).toBeInTheDocument();
  });

  test('fecha o modal ao clicar em Cancelar', () => {
    renderModal();
    
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('permite interação com o formulário', () => {
    renderModal();
    
    // Verifica se os campos estão presentes
    const inputs = screen.getAllByRole('textbox');
    const selects = screen.getAllByRole('combobox');
    
    expect(inputs.length).toBeGreaterThan(0);
    expect(selects.length).toBe(2); // Tipo e Raridade
    
    // Testa interação básica com o primeiro input (nome)
    fireEvent.change(inputs[0], { target: { value: 'Item Teste' } });
    expect(inputs[0]).toHaveValue('Item Teste');
  });

  test('chama createItem ao submeter o formulário', async () => {
    mockedApi.createItem.mockResolvedValueOnce({} as any);
    renderModal();
    
    const inputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Forjar Item' });
    
    // Preenche o nome do item
    fireEvent.change(inputs[0], { target: { value: 'Poção de Cura' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedApi.createItem).toHaveBeenCalled();
    });
  });

  test('chama callbacks após criação bem-sucedida', async () => {
    mockedApi.createItem.mockResolvedValueOnce({} as any);
    renderModal();
    
    const inputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Forjar Item' });
    
    fireEvent.change(inputs[0], { target: { value: 'Item Teste' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnItemCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('exibe erro quando a criação falha', async () => {
    const errorMessage = 'Erro ao criar item';
    mockedApi.createItem.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    });
    renderModal();
    
    const inputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Forjar Item' });
    
    fireEvent.change(inputs[0], { target: { value: 'Item Teste' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});