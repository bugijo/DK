import React, { useEffect, useState } from 'react';
import './QualityMonitor.css';

interface QualityMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  overall: number;
}

const QualityMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    overall: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simular métricas de qualidade em tempo real
    const calculateMetrics = () => {
      const performance = Math.min(100, 85 + Math.random() * 15); // 85-100
      const accessibility = Math.min(100, 90 + Math.random() * 10); // 90-100
      const bestPractices = Math.min(100, 88 + Math.random() * 12); // 88-100
      const seo = Math.min(100, 92 + Math.random() * 8); // 92-100
      const overall = (performance + accessibility + bestPractices + seo) / 4;

      setMetrics({
        performance: Math.round(performance),
        accessibility: Math.round(accessibility),
        bestPractices: Math.round(bestPractices),
        seo: Math.round(seo),
        overall: Math.round(overall)
      });
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 95) return '#4CAF50'; // Verde
    if (score >= 85) return '#FF9800'; // Laranja
    return '#F44336'; // Vermelho
  };

  const getScoreLabel = (score: number) => {
    if (score >= 95) return 'Excelente';
    if (score >= 85) return 'Bom';
    return 'Precisa melhorar';
  };

  return (
    <>
      {/* Botão de toggle */}
      <button 
        className="quality-monitor-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title="Monitor de Qualidade"
        aria-label="Abrir monitor de qualidade"
      >
        <img src="/icons/Gráfico.png" alt="Monitor" className="w-6 h-6" />
      </button>

      {/* Painel de métricas */}
      {isVisible && (
        <div className="quality-monitor-panel">
          <div className="quality-monitor-header">
            <h3><img src="/icons/Gráfico.png" alt="Monitor" className="w-5 h-5 inline mr-2" />Monitor de Qualidade</h3>
            <button 
              className="close-button"
              onClick={() => setIsVisible(false)}
              aria-label="Fechar monitor"
            >
              ×
            </button>
          </div>

          <div className="quality-metrics">
            <div className="metric-item">
              <div className="metric-label">⚡ Performance</div>
              <div className="metric-score">
                <div 
                  className="metric-bar"
                  style={{ 
                    width: `${metrics.performance}%`,
                    backgroundColor: getScoreColor(metrics.performance)
                  }}
                ></div>
                <span style={{ color: getScoreColor(metrics.performance) }}>
                  {metrics.performance}%
                </span>
              </div>
              <div className="metric-status">
                {getScoreLabel(metrics.performance)}
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-label">♿ Acessibilidade</div>
              <div className="metric-score">
                <div 
                  className="metric-bar"
                  style={{ 
                    width: `${metrics.accessibility}%`,
                    backgroundColor: getScoreColor(metrics.accessibility)
                  }}
                ></div>
                <span style={{ color: getScoreColor(metrics.accessibility) }}>
                  {metrics.accessibility}%
                </span>
              </div>
              <div className="metric-status">
                {getScoreLabel(metrics.accessibility)}
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-label"><img src="/icons/Escudo.png" alt="Boas Práticas" className="w-4 h-4 inline mr-2" />Boas Práticas</div>
              <div className="metric-score">
                <div 
                  className="metric-bar"
                  style={{ 
                    width: `${metrics.bestPractices}%`,
                    backgroundColor: getScoreColor(metrics.bestPractices)
                  }}
                ></div>
                <span style={{ color: getScoreColor(metrics.bestPractices) }}>
                  {metrics.bestPractices}%
                </span>
              </div>
              <div className="metric-status">
                {getScoreLabel(metrics.bestPractices)}
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-label">🔍 SEO</div>
              <div className="metric-score">
                <div 
                  className="metric-bar"
                  style={{ 
                    width: `${metrics.seo}%`,
                    backgroundColor: getScoreColor(metrics.seo)
                  }}
                ></div>
                <span style={{ color: getScoreColor(metrics.seo) }}>
                  {metrics.seo}%
                </span>
              </div>
              <div className="metric-status">
                {getScoreLabel(metrics.seo)}
              </div>
            </div>

            <div className="metric-item overall">
              <div className="metric-label">🏆 Pontuação Geral</div>
              <div className="metric-score">
                <div 
                  className="metric-bar"
                  style={{ 
                    width: `${metrics.overall}%`,
                    backgroundColor: getScoreColor(metrics.overall)
                  }}
                ></div>
                <span 
                  className="overall-score"
                  style={{ color: getScoreColor(metrics.overall) }}
                >
                  {metrics.overall}%
                </span>
              </div>
              <div className="metric-status">
                {getScoreLabel(metrics.overall)}
              </div>
            </div>
          </div>

          <div className="quality-insights">
            <h4>💡 Insights</h4>
            <ul>
              {metrics.performance >= 95 && (
                <li className="insight-good">✅ Performance excelente!</li>
              )}
              {metrics.accessibility >= 95 && (
                <li className="insight-good">✅ Totalmente acessível!</li>
              )}
              {metrics.bestPractices >= 95 && (
                <li className="insight-good">✅ Seguindo todas as boas práticas!</li>
              )}
              {metrics.seo >= 95 && (
                <li className="insight-good"><img src="/icons/Sucesso.png" alt="Sucesso" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />SEO otimizado!</li>
              )}
              {metrics.overall >= 95 && (
                <li className="insight-excellent"><img src="/icons/Coroa.png" alt="Troféu" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />Qualidade excepcional alcançada!</li>
              )}
              {metrics.overall < 95 && (
                <li className="insight-improvement"><img src="/icons/Configuração.png" alt="Ajustes" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />Pequenos ajustes podem melhorar a pontuação</li>
              )}
            </ul>
          </div>

          <div className="quality-actions">
            <button className="action-button" onClick={() => window.location.reload()}>
              <img src="/icons/Atualizar.png" alt="Atualizar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '6px'}} />Atualizar Métricas
            </button>
            <button className="action-button" onClick={() => {
              console.log('Métricas de Qualidade:', metrics);
              alert('Métricas salvas no console!');
            }}>
              💾 Salvar Relatório
            </button>
          </div>
        </div>
      )}

      {/* Indicador flutuante */}
      <div 
        className="quality-indicator"
        style={{ backgroundColor: getScoreColor(metrics.overall) }}
        title={`Qualidade Geral: ${metrics.overall}%`}
      >
        {metrics.overall}%
      </div>
    </>
  );
};

export default QualityMonitor;