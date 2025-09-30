import React, { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-remove após duração especificada
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Tempo da animação de saída
  };

  const getToastStyles = () => {
    const baseStyles = 'flex items-start p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-900/80 border-green-500 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/80 border-red-500 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/80 border-yellow-500 text-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-900/80 border-blue-500 text-blue-100`;
      default:
        return `${baseStyles} bg-gray-900/80 border-gray-500 text-gray-100`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return <img src="/icons/Alerta-Aviso.png" alt="Aviso" style={{width: '16px', height: '16px', display: 'inline'}} />;
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getToastStyles()}
      `}
    >
      <div className="flex-shrink-0 mr-3 text-xl">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 ml-3 text-lg opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // 5 segundos por padrão
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Funções de conveniência
  const showSuccess = (title: string, message: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}