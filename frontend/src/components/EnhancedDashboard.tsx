import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import '../theme.css';

const dashboardItems = [
  {
    id: 'tables',
    title: 'MESAS DE AVENTURA',
    description: 'Gerencie e participe de épicas jornadas de RPG',
    icon: 'table',
    link: '/tables',
    color: '#e94560',
    stats: { active: 12, total: 25 }
  },
  {
    id: 'characters',
    title: 'HERÓIS & GUERREIROS',
    description: 'Crie e desenvolva seus personagens lendários',
    icon: 'npc',
    link: '/characters',
    color: '#3498db',
    stats: { active: 8, total: 15 }
  },
  {
    id: 'missions',
    title: 'MISSÕES ÉPICAS',
    description: 'Complete desafios e conquiste glória eterna',
    icon: 'missoes',
    link: '/missions',
    color: '#f39c12',
    stats: { active: 5, total: 20 }
  },
  {
    id: 'inventory',
    title: 'ARSENAL & TESOUROS',
    description: 'Gerencie armas, armaduras e itens mágicos',
    icon: 'inventario',
    link: '/inventory',
    color: '#27ae60',
    stats: { active: 156, total: 200 }
  },
  {
    id: 'tools',
    title: 'FORJA DO MESTRE',
    description: 'Ferramentas para criar mundos fantásticos',
    icon: 'criacoes',
    link: '/creation-tools',
    color: '#9b59b6',
    stats: { active: 23, total: 30 }
  },
  {
    id: 'store',
    title: 'MERCADO MEDIEVAL',
    description: 'Adquira equipamentos e recursos raros',
    icon: 'loja',
    link: '/store',
    color: '#e67e22',
    stats: { active: 89, total: 150 }
  },
  {
    id: 'monsters',
    title: 'BESTIÁRIO',
    description: 'Catálogo de criaturas e monstros',
    icon: 'monstros',
    link: '/monsters',
    color: '#c0392b',
    stats: { active: 45, total: 80 }
  },
  {
    id: 'npcs',
    title: 'PERSONAGENS',
    description: 'NPCs e personagens não-jogáveis',
    icon: 'npc',
    link: '/npcs',
    color: '#16a085',
    stats: { active: 67, total: 100 }
  },
  {
    id: 'map',
    title: 'ATLAS MUNDIAL',
    description: 'Mapas e localizações do mundo',
    icon: 'mapa',
    link: '/maps',
    color: '#2980b9',
    stats: { active: 12, total: 25 }
  }
];

interface DashboardCardProps {
  item: typeof dashboardItems[0];
  index: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ item, index }) => {
  const progressPercentage = (item.stats.active / item.stats.total) * 100;

  return (
    <Link to={item.link} className="block">
      <div 
        className="dk-dashboard-card dk-animate-fade-in"
        style={{ 
          animationDelay: `${index * 0.1}s`,
          '--card-color': item.color 
        } as React.CSSProperties & { '--card-color': string }}
      >
        <div className="dk-dashboard-icon">
          <Icon name={item.icon} size={32} color="white" />
        </div>
        
        <h3 className="dk-dashboard-title">{item.title}</h3>
        <p className="dk-dashboard-description">{item.description}</p>
        
        <div className="dashboard-stats">
          <div className="stats-row">
            <span className="stats-label">Ativo:</span>
            <span className="stats-value">{item.stats.active}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">Total:</span>
            <span className="stats-value">{item.stats.total}</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: item.color 
              }}
            />
          </div>
          <div className="progress-text">
            {Math.round(progressPercentage)}% Completo
          </div>
        </div>
      </div>
    </Link>
  );
};

const QuickActions = () => {
  const quickActions = [
    { icon: 'creation', label: 'Criar Novo', action: () => console.log('Criar') },
    { icon: 'configuracao', label: 'Configurações', action: () => console.log('Config') },
    { icon: 'gold', label: 'Economia', action: () => console.log('Economia') },
    { icon: 'diamond', label: 'Premium', action: () => console.log('Premium') }
  ];

  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">Ações Rápidas</h3>
      <div className="quick-actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={action.label}
            className="quick-action-btn dk-animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={action.action}
          >
            <Icon name={action.icon} size={20} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const WelcomeHeader = () => {
  return (
    <header className="welcome-header">
      <div className="welcome-content">
        <div className="logo-section">
          <div className="logo-icon">
            <Icon name="diamond" size={48} color="#f39c12" />
          </div>
          <div className="welcome-text">
            <h1 className="welcome-title">
              <Icon name="gems" size={24} color="#f39c12" className="title-icon" />
              BEM-VINDO AO DUNGEON KEEPER
              <Icon name="gems" size={24} color="#f39c12" className="title-icon" />
            </h1>
            <p className="welcome-subtitle">~ Reino das Aventuras Épicas ~</p>
          </div>
        </div>
        
        <div className="user-info">
          <div className="user-stats">
            <div className="stat-item">
              <Icon name="gold" size={16} color="#f39c12" />
              <span>2,450 Ouro</span>
            </div>
            <div className="stat-item">
              <Icon name="gems" size={16} color="#e74c3c" />
              <span>89 Gemas</span>
            </div>
            <div className="stat-item">
              <Icon name="heart" size={16} color="#e74c3c" />
              <span>Nível 15</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const EnhancedDashboard: React.FC = () => {
  return (
    <div className="enhanced-dashboard">
      <WelcomeHeader />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          <QuickActions />
          
          <section className="dashboard-section">
            <h2 className="section-title">
              <Icon name="table" size={24} className="section-icon" />
              Painel Principal
            </h2>
            
            <div className="dk-dashboard-grid">
              {dashboardItems.map((item, index) => (
                <DashboardCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .enhanced-dashboard {
          min-height: 100vh;
          background: var(--dk-bg-primary);
          position: relative;
        }

        .welcome-header {
          background: var(--dk-gradient-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: var(--dk-spacing-xl) var(--dk-spacing-lg);
        }

        .welcome-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--dk-spacing-lg);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-lg);
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          background: var(--dk-gradient-accent);
          border-radius: var(--dk-border-radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--dk-shadow-lg);
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--dk-text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
        }

        .title-icon {
          animation: dk-pulse 2s infinite;
        }

        @keyframes dk-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .welcome-subtitle {
          font-size: 1rem;
          color: var(--dk-text-secondary);
          margin: var(--dk-spacing-sm) 0 0;
          font-style: italic;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-stats {
          display: flex;
          gap: var(--dk-spacing-lg);
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
          background: rgba(255, 255, 255, 0.1);
          padding: var(--dk-spacing-sm) var(--dk-spacing-md);
          border-radius: var(--dk-border-radius);
          color: var(--dk-text-primary);
          font-weight: 500;
        }

        .dashboard-main {
          padding: var(--dk-spacing-xl) var(--dk-spacing-lg);
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .quick-actions {
          margin-bottom: var(--dk-spacing-2xl);
        }

        .quick-actions-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--dk-text-primary);
          margin-bottom: var(--dk-spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--dk-spacing-md);
          max-width: 800px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
          padding: var(--dk-spacing-md);
          background: var(--dk-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--dk-border-radius);
          color: var(--dk-text-primary);
          cursor: pointer;
          transition: all var(--dk-transition-fast);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .quick-action-btn:hover {
          background: var(--dk-bg-hover);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--dk-text-primary);
          margin-bottom: var(--dk-spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
        }

        .section-icon {
          color: var(--dk-accent);
        }

        .dashboard-stats {
          margin-top: var(--dk-spacing-lg);
          padding-top: var(--dk-spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--dk-spacing-sm);
          font-size: 0.875rem;
        }

        .stats-label {
          color: var(--dk-text-secondary);
        }

        .stats-value {
          color: var(--dk-text-primary);
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin: var(--dk-spacing-sm) 0;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width var(--dk-transition-normal);
        }

        .progress-text {
          text-align: center;
          font-size: 0.75rem;
          color: var(--dk-text-muted);
        }

        @media (max-width: 768px) {
          .welcome-content {
            flex-direction: column;
            text-align: center;
          }

          .user-stats {
            justify-content: center;
          }

          .welcome-title {
            font-size: 1.5rem;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;