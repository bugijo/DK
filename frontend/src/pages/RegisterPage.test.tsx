import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import * as api from '../services/api';

// Mock da API
jest.mock('../services/api', () => ({
  registerUser: jest.fn()
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock do react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    success: jest.fn(),
    error: jest.fn()
  },
  __esModule: true
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderRegisterPage = () => {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  test('renderiza o formulário de registro corretamente', () => {
    renderRegisterPage();
    
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Campo de senha
    expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
  });

  test('permite digitar nos campos de entrada', () => {
    renderRegisterPage();
    
    const usernameInput = screen.getByLabelText('Nome de Usuário');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByPlaceholderText('Digite sua senha (mín. 6 caracteres)');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  test('renderiza sem falhas', () => {
    renderRegisterPage();
    expect(document.body).toBeInTheDocument();
  });

  test('exibe link para página de login', () => {
    renderRegisterPage();
    
    const loginLink = screen.getByText('Faça o login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});