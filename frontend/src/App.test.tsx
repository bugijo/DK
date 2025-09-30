import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock dos stores
jest.mock('./stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    initialize: jest.fn(),
  }),
}));

// Mock da API
jest.mock('./services/api', () => ({
  loginUser: jest.fn(),
}));

// Mock do react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

test('renders app without crashing', () => {
  render(<App />);
  
  // O teste passa se não houver exceções durante a renderização
  expect(document.body).toBeInTheDocument();
});
