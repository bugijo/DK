import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ItemDetailPage } from './ItemDetailPage';
import { getItemById, updateItem, deleteItem } from '../services/api';

// Mock das APIs
jest.mock('../services/api', () => ({
  getItemById: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn()
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate
}));

const mockGetItemById = getItemById as jest.MockedFunction<typeof getItemById>;
const mockUpdateItem = updateItem as jest.MockedFunction<typeof updateItem>;
const mockDeleteItem = deleteItem as jest.MockedFunction<typeof deleteItem>;

const mockItem = {
  id: '1',
  creator_id: 'user1',
  name: 'Espada Flamejante',
  type: 'Weapon',
  rarity: 'Rare',
  description: 'Uma espada que emana chamas mágicas',
  image_url: 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/sword.svg',
  price: 250
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock do window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn()
});

describe('ItemDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.confirm as jest.Mock).mockReturnValue(true);
  });

  it('deve exibir estado de carregamento inicialmente', () => {
    mockGetItemById.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<ItemDetailPage />);
    
    expect(screen.getByText('Carregando item...')).toBeInTheDocument();
  });

  it('deve carregar e exibir detalhes do item', async () => {
    mockGetItemById.mockResolvedValue(mockItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Espada Flamejante')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Rare Weapon')).toBeInTheDocument();
    expect(screen.getByText('Uma espada que emana chamas mágicas')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Deletar')).toBeInTheDocument();
  });

  it('deve chamar getItemById com o ID correto', async () => {
    mockGetItemById.mockResolvedValue(mockItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    expect(mockGetItemById).toHaveBeenCalledWith('1');
  });

  it('deve entrar em modo de edição ao clicar no botão Editar', async () => {
    mockGetItemById.mockResolvedValue(mockItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Editar'));
    
    expect(screen.getByText('Editando: Espada Flamejante')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Uma espada que emana chamas mágicas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Weapon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rare')).toBeInTheDocument();
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve cancelar edição ao clicar no botão Cancelar', async () => {
    mockGetItemById.mockResolvedValue(mockItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
    
    // Entrar em modo de edição
    fireEvent.click(screen.getByText('Editar'));
    expect(screen.getByText('Editando: Espada Flamejante')).toBeInTheDocument();
    
    // Cancelar edição
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(screen.getByText('Espada Flamejante')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.queryByText('Editando: Espada Flamejante')).not.toBeInTheDocument();
  });

  it('deve permitir editar campos do formulário', async () => {
    mockGetItemById.mockResolvedValue(mockItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Editar'));
    
    const descriptionField = screen.getByDisplayValue('Uma espada que emana chamas mágicas');
    const typeField = screen.getByDisplayValue('Weapon');
    const rarityField = screen.getByDisplayValue('Rare');
    
    fireEvent.change(descriptionField, { target: { value: 'Nova descrição' } });
    fireEvent.change(typeField, { target: { value: 'Armor' } });
    fireEvent.change(rarityField, { target: { value: 'Legendary' } });
    
    expect(descriptionField).toHaveValue('Nova descrição');
    expect(typeField).toHaveValue('Armor');
    expect(rarityField).toHaveValue('Legendary');
  });

  it('deve salvar alterações ao submeter o formulário', async () => {
    const updatedItem = { ...mockItem, description: 'Nova descrição' };
    mockGetItemById.mockResolvedValue(mockItem);
    mockUpdateItem.mockResolvedValue(updatedItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Editar'));
    
    const descriptionField = screen.getByDisplayValue('Uma espada que emana chamas mágicas');
    fireEvent.change(descriptionField, { target: { value: 'Nova descrição' } });
    
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalledWith('1', {
        description: 'Nova descrição',
        type: 'Weapon',
        rarity: 'Rare'
      });
    });
    
    // Deve sair do modo de edição e exibir o conteúdo atualizado
    await waitFor(() => {
      expect(screen.getByText('Nova descrição')).toBeInTheDocument();
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
  });

  it('deve deletar item com confirmação', async () => {
    mockGetItemById.mockResolvedValue(mockItem);
    mockDeleteItem.mockResolvedValue(undefined);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Deletar'));
    
    expect(window.confirm).toHaveBeenCalledWith(
      'Tem certeza que deseja deletar o item "Espada Flamejante"? Esta ação é irreversível.'
    );
    
    await waitFor(() => {
      expect(mockDeleteItem).toHaveBeenCalledWith('1');
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/tools/items');
  });

  it('não deve deletar item se confirmação for cancelada', async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    mockGetItemById.mockResolvedValue(mockItem);
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Deletar'));
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteItem).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve lidar com erro ao carregar item', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetItemById.mockRejectedValue(new Error('Erro ao carregar'));
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(new Error('Erro ao carregar'));
    });
    
    consoleSpy.mockRestore();
  });

  it('deve lidar com erro ao atualizar item', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetItemById.mockResolvedValue(mockItem);
    mockUpdateItem.mockRejectedValue(new Error('Erro ao atualizar'));
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Editar'));
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao atualizar o item:', new Error('Erro ao atualizar'));
    });
    
    consoleSpy.mockRestore();
  });

  it('deve lidar com erro ao deletar item', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetItemById.mockResolvedValue(mockItem);
    mockDeleteItem.mockRejectedValue(new Error('Erro ao deletar'));
    
    renderWithRouter(<ItemDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Deletar'));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao deletar o item:', new Error('Erro ao deletar'));
    });
    
    consoleSpy.mockRestore();
  });
});