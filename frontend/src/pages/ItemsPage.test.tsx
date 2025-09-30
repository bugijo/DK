import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ItemsPage } from './ItemsPage';
import { getUserItems } from '../services/api';

// Mock da API
jest.mock('../services/api', () => ({
  getUserItems: jest.fn()
}));

// Mock do CreateItemModal
jest.mock('../components/CreateItemModal', () => ({
  CreateItemModal: ({ isOpen, onClose, onItemCreated }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="create-item-modal">
        <button onClick={onClose}>Fechar</button>
        <button onClick={() => { onItemCreated(); onClose(); }}>Criar Item</button>
      </div>
    );
  }
}));

const mockGetUserItems = getUserItems as jest.MockedFunction<typeof getUserItems>;

const mockItems = [
  {
    id: '1',
    creator_id: 'user1',
    name: 'Espada Flamejante',
    type: 'Weapon',
    rarity: 'Rare',
    description: 'Uma espada que emana chamas mágicas',
    image_url: 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/sword.svg',
    price: 250
  },
  {
    id: '2',
    creator_id: 'user1',
    name: 'Anel da Proteção',
    type: 'Ring',
    rarity: 'Uncommon',
    description: 'Oferece proteção contra ataques',
    image_url: 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/ring.svg',
    price: 120
  },
  {
    id: '3',
    creator_id: 'user1',
    name: 'Poção Simples',
    type: 'Potion',
    rarity: 'Common',
    description: null,
    image_url: 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/health-potion.svg',
    price: 25
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ItemsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir estado de carregamento inicialmente', () => {
    mockGetUserItems.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<ItemsPage />);
    
    expect(screen.getByText('Carregando arsenal...')).toBeInTheDocument();
  });

  it('deve renderizar a página com título e botão de criar item', async () => {
    mockGetUserItems.mockResolvedValue(mockItems);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Arsenal de Itens')).toBeInTheDocument();
    });
    
    expect(screen.getByText('+ Forjar Novo Item')).toBeInTheDocument();
  });

  it('deve exibir lista de itens quando carregados com sucesso', async () => {
    mockGetUserItems.mockResolvedValue(mockItems);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Espada Flamejante')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Anel da Proteção')).toBeInTheDocument();
    expect(screen.getByText('Poção Simples')).toBeInTheDocument();
    expect(screen.getByText('Raro')).toBeInTheDocument();
    expect(screen.getByText('Incomum')).toBeInTheDocument();
    expect(screen.getByText('Comum')).toBeInTheDocument();
  });

  it('deve exibir tipos traduzidos corretamente', async () => {
    mockGetUserItems.mockResolvedValue(mockItems);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Arma')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Anel')).toBeInTheDocument();
    expect(screen.getByText('Poção')).toBeInTheDocument();
  });

  it('deve exibir "Sem descrição" para itens sem descrição', async () => {
    mockGetUserItems.mockResolvedValue(mockItems);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Sem descrição')).toBeInTheDocument();
    });
  });

  it('deve exibir estado vazio quando não há itens', async () => {
    mockGetUserItems.mockResolvedValue([]);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Arsenal Vazio')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Você ainda não forjou nenhum item. Que tal criar seu primeiro equipamento épico?')).toBeInTheDocument();
    expect(screen.getByText('Forjar Primeiro Item')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando falha ao carregar itens', async () => {
    const errorMessage = 'Erro ao carregar itens';
    mockGetUserItems.mockRejectedValue({
      response: { data: { detail: errorMessage } }
    });
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('deve abrir modal ao clicar no botão "Forjar Novo Item"', async () => {
    mockGetUserItems.mockResolvedValue(mockItems);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Forjar Novo Item')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('+ Forjar Novo Item'));
    
    expect(screen.getByTestId('create-item-modal')).toBeInTheDocument();
  });

  it('deve abrir modal ao clicar no botão "Forjar Primeiro Item" no estado vazio', async () => {
    mockGetUserItems.mockResolvedValue([]);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Forjar Primeiro Item')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Forjar Primeiro Item'));
    
    expect(screen.getByTestId('create-item-modal')).toBeInTheDocument();
  });

  it('deve fechar modal e recarregar itens após criação', async () => {
    mockGetUserItems.mockResolvedValue([]);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Forjar Primeiro Item')).toBeInTheDocument();
    });
    
    // Abrir modal
    fireEvent.click(screen.getByText('Forjar Primeiro Item'));
    expect(screen.getByTestId('create-item-modal')).toBeInTheDocument();
    
    // Simular criação de item
    fireEvent.click(screen.getByText('Criar Item'));
    
    // Verificar se getUserItems foi chamado novamente
    expect(mockGetUserItems).toHaveBeenCalledTimes(2);
    
    // Modal deve estar fechado
    expect(screen.queryByTestId('create-item-modal')).not.toBeInTheDocument();
  });

  it('deve criar links corretos para detalhes dos itens', async () => {
    mockGetUserItems.mockResolvedValue(mockItems);
    
    renderWithRouter(<ItemsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Espada Flamejante')).toBeInTheDocument();
    });
    
    const itemLink = screen.getByText('Espada Flamejante').closest('a');
    expect(itemLink).toHaveAttribute('href', '/tools/items/1');
  });
});