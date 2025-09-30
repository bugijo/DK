import { useState, useEffect } from 'react';

export interface GameSettings {
  autoSave: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  showAnimations: boolean;
  showTooltips: boolean;
  compactMode: boolean;
  language: string;
}

const DEFAULT_SETTINGS: GameSettings = {
  autoSave: true,
  soundEnabled: true,
  musicVolume: 70,
  sfxVolume: 80,
  showAnimations: true,
  showTooltips: true,
  compactMode: false,
  language: 'pt-BR'
};

const STORAGE_KEY = 'gameSettings';

export function useGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega configurações do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Mescla com configurações padrão para garantir que todas as propriedades existam
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Em caso de erro, usa configurações padrão
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salva configurações no localStorage sempre que mudarem
  const saveSettings = (newSettings: GameSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw new Error('Não foi possível salvar as configurações');
    }
  };

  // Atualiza uma configuração específica
  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // Restaura configurações padrão
  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      throw new Error('Não foi possível restaurar as configurações');
    }
  };

  // Exporta configurações para backup
  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  // Importa configurações de backup
  const importSettings = (settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson);
      // Valida se as configurações importadas são válidas
      const validatedSettings = { ...DEFAULT_SETTINGS, ...imported };
      saveSettings(validatedSettings);
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      throw new Error('Formato de configurações inválido');
    }
  };

  return {
    settings,
    isLoading,
    updateSetting,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    defaultSettings: DEFAULT_SETTINGS
  };
}