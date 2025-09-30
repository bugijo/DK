import { create } from 'zustand';

type Theme = 'theme-dark' | 'theme-light';

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'theme-dark', // Padrão
  setTheme: (newTheme) => {
    localStorage.setItem('app-theme', newTheme);
    set({ theme: newTheme });
  },
  initializeTheme: () => {
    const savedTheme = localStorage.getItem('app-theme') as Theme | null;
    if (savedTheme) {
      set({ theme: savedTheme });
    }
  },
}));

// Inicializa o tema ao carregar a aplicação
useUIStore.getState().initializeTheme();