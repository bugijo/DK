import React, { useState, useEffect } from 'react';
import { audioManager, AudioSettings as AudioSettingsType, SoundType } from '../services/audioManager';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AudioSettingsType>({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    ambientVolume: 0.5,
    musicVolume: 0.6,
    enabled: true
  });

  useEffect(() => {
    if (isOpen) {
      setSettings(audioManager.getSettings());
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof AudioSettingsType, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    audioManager.updateSettings(newSettings);
  };

  const testSound = (type: 'ui' | 'combat' | 'dice' | 'ambient') => {
    switch (type) {
      case 'ui':
        audioManager.playUISound('click');
        break;
      case 'combat':
        audioManager.playAttack('sword');
        break;
      case 'dice':
        audioManager.playDiceRoll(15, 20);
        break;
      case 'ambient':
        audioManager.setAmbientSound(SoundType.TAVERN_AMBIENT);
        setTimeout(() => audioManager.setAmbientSound(null), 3000);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🔊 Configurações de Áudio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Ativar/Desativar Áudio */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Áudio Habilitado
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Volume Geral */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Volume Geral
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.masterVolume}
              onChange={(e) => handleSettingChange('masterVolume', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
            />
          </div>

          {/* Volume de Efeitos Sonoros */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Efeitos Sonoros
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => testSound('ui')}
                  disabled={!settings.enabled}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Testar
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.sfxVolume}
              onChange={(e) => handleSettingChange('sfxVolume', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
            />
          </div>

          {/* Volume Ambiente */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sons Ambientais
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => testSound('ambient')}
                  disabled={!settings.enabled}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Testar
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(settings.ambientVolume * 100)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.ambientVolume}
              onChange={(e) => handleSettingChange('ambientVolume', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
            />
          </div>

          {/* Volume de Música */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Música de Fundo
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) => handleSettingChange('musicVolume', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
            />
          </div>

          {/* Testes de Sons Específicos */}
          <div className="border-t pt-4 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Testar Sons Específicos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => testSound('combat')}
                disabled={!settings.enabled}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="/icons/Equipamentos.png" alt="Combate" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />Combate
              </button>
              <button
                onClick={() => testSound('dice')}
                disabled={!settings.enabled}
                className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="/icons/Sistema de Dados.png" alt="Dados" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />Dados
              </button>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Os sons são gerados proceduralmente para uma experiência imersiva sem arquivos externos.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              const defaultSettings = {
                masterVolume: 0.7,
                sfxVolume: 0.8,
                ambientVolume: 0.5,
                musicVolume: 0.6,
                enabled: true
              };
              setSettings(defaultSettings);
              audioManager.updateSettings(defaultSettings);
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Restaurar Padrão
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;