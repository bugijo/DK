import React, { useState } from 'react';
import { useToastContext } from '../contexts/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'export' | 'import';
  onExport?: () => string;
  onImport?: (data: string) => void;
}

export function SettingsModal({ isOpen, onClose, type, onExport, onImport }: SettingsModalProps) {
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const { showSuccess, showError } = useToastContext();

  React.useEffect(() => {
    if (isOpen && type === 'export' && onExport) {
      setExportData(onExport());
    }
  }, [isOpen, type, onExport]);

  const handleImport = () => {
    if (!importData.trim()) {
      showError('Erro', 'Por favor, cole os dados de configuração.');
      return;
    }

    try {
      onImport?.(importData);
      showSuccess('Sucesso', 'Configurações importadas com sucesso!');
      onClose();
      setImportData('');
    } catch (error) {
      showError('Erro', 'Dados de configuração inválidos.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      showSuccess('Copiado', 'Configurações copiadas para a área de transferência!');
    } catch (error) {
      showError('Erro', 'Não foi possível copiar para a área de transferência.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dk-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Download', 'Arquivo de configurações baixado!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {type === 'export' ? 'Exportar Configurações' : 'Importar Configurações'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {type === 'export' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suas configurações estão prontas para exportação. Você pode copiar ou baixar o arquivo.
            </p>
            
            <textarea
              value={exportData}
              readOnly
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
              placeholder="Dados de configuração..."
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
              >
                📋 Copiar
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg"
              >
                💾 Baixar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cole os dados de configuração exportados anteriormente.
            </p>
            
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Cole aqui os dados de configuração..."
            />
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg"
              >
                Importar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}