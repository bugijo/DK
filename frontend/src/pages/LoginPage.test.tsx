import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import * as api from '../services/api';

// Mock da API
jest.mock('../services/api', () => ({
  loginUser: jest.fn()
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock do react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
  Toaster: () => null
}));

// Mock do authStore
const mockLogin = jest.fn();
jest.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin
  })
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  const renderLoginPage = () => {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  test('deve renderizar o formulário de login corretamente', () => {
    renderLoginPage();
    
    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument();
  });

  test('deve permitir que um usuário faça login com sucesso', async () => {
    const mockUserData = {
      access_token: 'fake-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      }
    };
    
    mockedApi.loginUser.mockResolvedValueOnce(mockUserData);
    
    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/nome de usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApi.loginUser).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  test('deve exibir erro quando as credenciais estão vazias', () => {
    renderLoginPage();
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.click(submitButton);
    
    // O formulário HTML5 deve impedir o envio com campos obrigatórios vazios
    expect(mockedApi.loginUser).not.toHaveBeenCalled();
  });

  test('deve lidar com erro de login da API', async () => {
    const errorMessage = 'Credenciais inválidas';
    mockedApi.loginUser.mockRejectedValueOnce(new Error(errorMessage));
    
    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/nome de usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApi.loginUser).toHaveBeenCalledWith({
        username: 'wronguser',
        password: 'wrongpassword'
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('deve desabilitar o botão durante o carregamento', async () => {
    let resolveLogin: (value: { access_token: string }) => void;
    const loginPromise = new Promise<{ access_token: string }>((resolve) => {
      resolveLogin = resolve;
    });
    
    mockedApi.loginUser.mockReturnValueOnce(loginPromise);
    
    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/nome de usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise to clean up
    resolveLogin!({
      access_token: 'fake-token'
    });
  });
});