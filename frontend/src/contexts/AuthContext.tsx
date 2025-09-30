import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useToastContext } from './ToastContext';

interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  bio?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  updateToken: (newToken: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { showSuccess, showError } = useToastContext();

  // Carregar token do localStorage na inicialização (apenas uma vez)
  useEffect(() => {
    if (!initialized) {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        setToken(savedToken);
        // Não validar automaticamente para evitar loops
      }
      setInitialized(true);
    }
  }, [initialized]);

  // Função de login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const tokenData = await response.json();
        const newToken = tokenData.access_token;
        
        // Salvar token
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        
        // Buscar dados do usuário
        const userResponse = await fetch('http://localhost:8000/api/v1/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          showSuccess('Login realizado', `Bem-vindo, ${userData.username}!`);
          return true;
        } else {
          showError('Erro no login', 'Erro ao buscar dados do usuário');
        }
      } else {
        const errorData = await response.json();
        showError('Erro no login', errorData.detail || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showError('Erro no login', 'Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  // Função de registro
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const userData = {
        username,
        email,
        password
      };

      const response = await fetch('http://localhost:8000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        showSuccess('Registro realizado', 'Usuário criado com sucesso! Faça login.');
        return true;
      } else {
        const errorData = await response.json();
        showError('Erro no registro', errorData.detail || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      showError('Erro no registro', 'Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    showSuccess('Logout realizado', 'Até logo!');
  };

  // Função para recarregar dados do usuário
  const refreshUser = async (): Promise<void> => {
    if (!token) return;
    
    try {
      const userResponse = await fetch('http://localhost:8000/api/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
    }
  };

  // Função para atualizar token
  const updateToken = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateToken,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;