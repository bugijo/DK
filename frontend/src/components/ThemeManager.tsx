import React, { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';

export function ThemeManager() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.className = theme;
  }, [theme]);

  return null; // Este componente não renderiza nada na tela
}