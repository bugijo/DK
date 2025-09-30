import React, { useEffect, useState } from 'react';
import { usePerformance, useDebounce } from '../hooks/usePerformance';
import './UXOptimizer.css';

interface UXOptimizerProps {
  children: React.ReactNode;
}

const UXOptimizer: React.FC<UXOptimizerProps> = ({ children }) => {
  const { metrics, isLoading, optimizePerformance, preloadCriticalResources } = usePerformance();
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    autoOptimize: true,
    preloadResources: true
  });

  // Carregar preferências do usuário
  useEffect(() => {
    const saved = localStorage.getItem('ux_preferences');
    if (saved) {
      setUserPreferences(JSON.parse(saved));
    }
  }, []);

  // Salvar preferências
  const savePreferences = useDebounce((prefs: typeof userPreferences) => {
    localStorage.setItem('ux_preferences', JSON.stringify(prefs));
  }, 500);

  useEffect(() => {
    savePreferences(userPreferences);
  }, [userPreferences]); // Removido savePreferences para evitar loops

  // Aplicar otimizações automáticas
  useEffect(() => {
    if (userPreferences.autoOptimize) {
      // Otimizar após 2 segundos de carregamento
      const timer = setTimeout(() => {
        optimizePerformance();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userPreferences.autoOptimize]); // Removido optimizePerformance para evitar loops

  // Preload de recursos críticos
  useEffect(() => {
    if (userPreferences.preloadResources) {
      preloadCriticalResources();
    }
  }, [userPreferences.preloadResources]); // Removido preloadCriticalResources para evitar loops

  // Aplicar preferências de acessibilidade
  useEffect(() => {
    const root = document.documentElement;
    
    if (userPreferences.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    if (userPreferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [userPreferences]);

  const toggleOptimizations = () => {
    setShowOptimizations(!showOptimizations);
  };

  const updatePreference = (key: keyof typeof userPreferences, value: boolean) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getPerformanceStatus = () => {
    if (metrics.loadTime < 1000) return { status: 'excellent', color: '#4CAF50', text: 'Excelente' };
    if (metrics.loadTime < 2000) return { status: 'good', color: '#FF9800', text: 'Bom' };
    return { status: 'poor', color: '#F44336', text: 'Precisa melhorar' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="ux-optimizer-container">
      {children}
      
      {/* Botão de otimizações */}
      <button 
        className="ux-optimizer-toggle"
        onClick={toggleOptimizations}
        title="Configurações de UX e Performance"
        aria-label="Abrir configurações de experiência do usuário"
      >
        ⚡
      </button>

      {/* Painel de otimizações */}
      {showOptimizations && (
        <div className="ux-optimizer-panel">
          <div className="ux-optimizer-header">
            <h3>🎯 Otimizações UX</h3>
            <button 
              className="close-button"
              onClick={toggleOptimizations}
              aria-label="Fechar painel"
            >
              ×
            </button>
          </div>

          {/* Métricas de Performance */}
          <div className="performance-metrics">
            <h4>📊 Performance</h4>
            <div className="metric">
              <span>Tempo de Carregamento:</span>
              <span style={{ color: performanceStatus.color }}>
                {metrics.loadTime.toFixed(0)}ms ({performanceStatus.text})
              </span>
            </div>
            <div className="metric">
              <span>Uso de Memória:</span>
              <span>{(metrics.memoryUsage * 100).toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span>Status:</span>
              <span style={{ color: metrics.isOptimized ? '#4CAF50' : '#FF9800' }}>
                {metrics.isOptimized ? '✅ Otimizado' : <><img src="/icons/Alerta-Aviso.png" alt="Aviso" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Não otimizado</>}
              </span>
            </div>
          </div>

          {/* Controles de Otimização */}
          <div className="optimization-controls">
            <h4><img src="/icons/Configuração.png" alt="Controles" style={{width: '20px', height: '20px', display: 'inline', marginRight: '8px'}} />Controles</h4>
            <button 
              className="optimize-button"
              onClick={optimizePerformance}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Otimizando...' : (
                <>
                  <img src="/icons/Velocidade.png" alt="Otimizar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />
                  Otimizar Agora
                </>
              )}
            </button>
          </div>

          {/* Preferências de Acessibilidade */}
          <div className="accessibility-preferences">
            <h4><img src="/icons/Acessibilidade.png" alt="Acessibilidade" style={{width: '20px', height: '20px', display: 'inline', marginRight: '8px'}} />Acessibilidade</h4>
            
            <label className="preference-item">
              <input
                type="checkbox"
                checked={userPreferences.reducedMotion}
                onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
              />
              <span>Reduzir animações</span>
            </label>

            <label className="preference-item">
              <input
                type="checkbox"
                checked={userPreferences.highContrast}
                onChange={(e) => updatePreference('highContrast', e.target.checked)}
              />
              <span>Alto contraste</span>
            </label>
          </div>

          {/* Preferências de Performance */}
          <div className="performance-preferences">
            <h4>⚡ Performance</h4>
            
            <label className="preference-item">
              <input
                type="checkbox"
                checked={userPreferences.autoOptimize}
                onChange={(e) => updatePreference('autoOptimize', e.target.checked)}
              />
              <span>Otimização automática</span>
            </label>

            <label className="preference-item">
              <input
                type="checkbox"
                checked={userPreferences.preloadResources}
                onChange={(e) => updatePreference('preloadResources', e.target.checked)}
              />
              <span>Pré-carregar recursos</span>
            </label>
          </div>

          {/* Dicas de UX */}
          <div className="ux-tips">
            <h4>💡 Dicas</h4>
            <ul>
              <li>Use Ctrl+K para busca rápida</li>
              <li>Clique duplo para edição rápida</li>
              <li>Arraste e solte para reorganizar</li>
              <li>Use Tab para navegação por teclado</li>
            </ul>
          </div>
        </div>
      )}

      {/* Indicador de performance no canto */}
      <div className="performance-indicator" style={{ backgroundColor: performanceStatus.color }}>
        <span>{performanceStatus.text}</span>
      </div>
    </div>
  );
};

export default UXOptimizer;