import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface UserProfile {
  username: string;
  userId: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
  setToken: (token: string) => void;
}

const API_BASE_URL = 'http://localhost:8000';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  
  setToken: (token: string) => {
    try {
      const decoded: { sub: string, user_id: string } = jwtDecode(token);
      const userProfile: UserProfile = { username: decoded.sub, userId: decoded.user_id };
      
      localStorage.setItem('auth_token', token); // Corrigido para 'auth_token'
      set({ token, user: userProfile });
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      toast.error('Token inválido');
    }
  },
  
  login: async (username: string, password: string): Promise<boolean> => {
    set({ isLoading: true });
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/api/v1/token`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        
        get().setToken(token);
        toast.success(`Bem-vindo, ${username}!`);
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Credenciais inválidas');
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro de conexão com o servidor');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (username: string, email: string, password: string): Promise<boolean> => {
    set({ isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Erro ao criar conta');
        return false;
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Erro de conexão com o servidor');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token'); // Corrigido para 'auth_token'
    set({ token: null, user: null });
    toast.success('Logout realizado com sucesso!');
  },
  
  initialize: () => {
    const token = localStorage.getItem('auth_token'); // Corrigido para 'auth_token'
    if (token) {
      try {
        const decoded: { sub: string, user_id: string, exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          const userProfile: UserProfile = { username: decoded.sub, userId: decoded.user_id };
          set({ token, user: userProfile });
        } else {
          localStorage.removeItem('auth_token');
          toast.error('Sessão expirada. Faça login novamente.');
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('auth_token');
      }
    }
  },
}));

// Inicializa a store para verificar se já existe um token no localStorage
useAuthStore.getState().initialize();