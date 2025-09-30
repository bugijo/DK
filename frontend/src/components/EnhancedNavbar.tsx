import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import '../theme.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'diamond', path: '/' },
  { id: 'tables', label: 'Mesas', icon: 'table', path: '/tables', badge: 3 },
  { id: 'characters', label: 'Personagens', icon: 'npc', path: '/characters' },
  { id: 'missions', label: 'Missões', icon: 'missoes', path: '/missions', badge: 5 },
  { id: 'inventory', label: 'Inventário', icon: 'inventario', path: '/inventory' },
  { id: 'monsters', label: 'Monstros', icon: 'monstros', path: '/monsters' },
  { id: 'npcs', label: 'NPCs', icon: 'npc', path: '/npcs' },
  { id: 'store', label: 'Loja', icon: 'loja', path: '/store' }
];

const toolsNavItems: NavItem[] = [
  { id: 'creation-tools', label: 'Ferramentas', icon: 'criacoes', path: '/creation-tools' },
  { id: 'maps', label: 'Mapas', icon: 'mapa', path: '/maps' },
  { id: 'settings', label: 'Configurações', icon: 'configuracao', path: '/settings' }
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({ 
  item, 
  isActive, 
  isMobile = false, 
  onClick 
}) => {
  return (
    <Link
      to={item.path}
      className={`nav-item ${isActive ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
      onClick={onClick}
    >
      <div className="nav-item-content">
        <Icon name={item.icon} size={isMobile ? 20 : 18} />
        <span className="nav-item-label">{item.label}</span>
        {item.badge && (
          <span className="nav-badge">{item.badge}</span>
        )}
      </div>
    </Link>
  );
};

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="user-menu">
      <button 
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          <Icon name="npc" size={20} />
        </div>
        <span className="user-name">Mestre</span>
        <Icon name="chevron-down" size={16} />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <Link to="/profile" className="user-menu-item">
            <Icon name="npc" size={16} />
            <span>Perfil</span>
          </Link>
          <Link to="/settings" className="user-menu-item">
            <Icon name="configuracao" size={16} />
            <span>Configurações</span>
          </Link>
          <div className="user-menu-divider" />
          <button className="user-menu-item logout" onClick={handleLogout}>
            <Icon name="sair" size={16} />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
};

const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h3>Menu Principal</h3>
          <button className="mobile-menu-close" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="mobile-menu-content">
          <div className="mobile-nav-section">
            <h4>Principal</h4>
            {mainNavItems.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={location.pathname === item.path}
                isMobile={true}
                onClick={onClose}
              />
            ))}
          </div>

          <div className="mobile-nav-section">
            <h4>Ferramentas</h4>
            {toolsNavItems.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={location.pathname === item.path}
                isMobile={true}
                onClick={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnhancedNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="enhanced-navbar">
        <div className="navbar-container">
          {/* Logo e Brand */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <Icon name="diamond" size={28} color="#f39c12" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Dungeon Keeper</span>
              <span className="brand-subtitle">RPG Master</span>
            </div>
          </Link>

          {/* Navegação Principal - Desktop */}
          <div className="navbar-nav desktop-nav">
            <div className="nav-group">
              {mainNavItems.slice(0, 6).map((item) => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>
          </div>

          {/* Ações da Direita */}
          <div className="navbar-actions">
            {/* Indicadores de Status */}
            <div className="status-indicators">
              <div className="status-item">
                <Icon name="gold" size={16} color="#f39c12" />
                <span>2,450</span>
              </div>
              <div className="status-item">
                <Icon name="gems" size={16} color="#e74c3c" />
                <span>89</span>
              </div>
            </div>

            {/* Menu do Usuário - Desktop */}
            <div className="desktop-only">
              <UserMenu />
            </div>

            {/* Botão Mobile Menu */}
            <button 
              className="mobile-menu-button mobile-only"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <style>{`
        .enhanced-navbar {
          background: var(--dk-gradient-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--dk-spacing-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-md);
          text-decoration: none;
          color: var(--dk-text-primary);
          transition: all var(--dk-transition-fast);
        }

        .navbar-brand:hover {
          transform: scale(1.02);
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: var(--dk-gradient-accent);
          border-radius: var(--dk-border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--dk-shadow-sm);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.125rem;
          font-weight: 700;
          line-height: 1;
        }

        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--dk-text-secondary);
          line-height: 1;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
        }

        .nav-group {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-xs);
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: var(--dk-spacing-sm) var(--dk-spacing-md);
          border-radius: var(--dk-border-radius);
          color: var(--dk-text-secondary);
          text-decoration: none;
          transition: all var(--dk-transition-fast);
          position: relative;
          white-space: nowrap;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--dk-text-primary);
        }

        .nav-item.active {
          background: rgba(243, 156, 18, 0.2);
          color: var(--dk-accent);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 2px;
          background: var(--dk-accent);
          border-radius: 1px;
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
          position: relative;
        }

        .nav-item-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .nav-badge {
          background: var(--dk-secondary);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-lg);
        }

        .status-indicators {
          display: flex;
          gap: var(--dk-spacing-md);
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-xs);
          background: rgba(255, 255, 255, 0.1);
          padding: var(--dk-spacing-xs) var(--dk-spacing-sm);
          border-radius: var(--dk-border-radius-sm);
          color: var(--dk-text-primary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-menu {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: var(--dk-spacing-sm);
          border-radius: var(--dk-border-radius);
          color: var(--dk-text-primary);
          cursor: pointer;
          transition: all var(--dk-transition-fast);
        }

        .user-menu-trigger:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--dk-gradient-accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--dk-spacing-sm);
          background: var(--dk-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--dk-border-radius);
          box-shadow: var(--dk-shadow-lg);
          min-width: 180px;
          overflow: hidden;
          z-index: 1001;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: var(--dk-spacing-sm);
          padding: var(--dk-spacing-md);
          color: var(--dk-text-primary);
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          transition: all var(--dk-transition-fast);
          font-size: 0.875rem;
        }

        .user-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-menu-item.logout {
          color: var(--dk-error);
        }

        .user-menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: var(--dk-spacing-xs) 0;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          color: var(--dk-text-primary);
          cursor: pointer;
          padding: var(--dk-spacing-sm);
          border-radius: var(--dk-border-radius);
          transition: all var(--dk-transition-fast);
        }

        .mobile-menu-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1002;
          display: flex;
          justify-content: flex-end;
        }

        .mobile-menu {
          background: var(--dk-bg-secondary);
          width: 300px;
          height: 100%;
          overflow-y: auto;
          box-shadow: var(--dk-shadow-xl);
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--dk-spacing-lg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-header h3 {
          color: var(--dk-text-primary);
          margin: 0;
          font-size: 1.125rem;
        }

        .mobile-menu-close {
          background: none;
          border: none;
          color: var(--dk-text-primary);
          cursor: pointer;
          padding: var(--dk-spacing-xs);
          border-radius: var(--dk-border-radius);
        }

        .mobile-menu-content {
          padding: var(--dk-spacing-lg);
        }

        .mobile-nav-section {
          margin-bottom: var(--dk-spacing-xl);
        }

        .mobile-nav-section h4 {
          color: var(--dk-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 var(--dk-spacing-md);
        }

        .nav-item.mobile {
          display: flex;
          width: 100%;
          padding: var(--dk-spacing-md);
          margin-bottom: var(--dk-spacing-xs);
          border-radius: var(--dk-border-radius);
        }

        .desktop-only {
          display: block;
        }

        .mobile-only {
          display: none;
        }

        @media (max-width: 1024px) {
          .desktop-nav {
            display: none;
          }

          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: block;
          }

          .status-indicators {
            display: none;
          }

          .brand-text {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 var(--dk-spacing-md);
          }

          .mobile-menu {
            width: 280px;
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedNavbar;