// frontend/src/components/ModernHeader.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ModernHeaderProps {
  className?: string;
}

export function ModernHeader({ className = '' }: ModernHeaderProps) {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detecta scroll para efeito de header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '/icons/Logo.png' },
    { path: '/tables', label: 'Mesas', icon: '/icons/Mesas de Aventura.png' },
    { path: '/characters', label: 'Personagens', icon: '/icons/Heróis & Guerreiros.png' },
    { path: '/tools', label: 'Ferramentas', icon: '/icons/Forja do Mestre.png' },
    { path: '/inventory', label: 'Inventário', icon: '/icons/Arsenal & Tesouros.png' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`modern-header ${scrolled ? 'scrolled' : ''} ${className}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo-container">
          <div className="logo-icon">
            <img src="/icons/Logo.png" alt="Dungeon Keeper" className="logo-image" />
          </div>
          <div className="logo-text">
            <span className="logo-title">Dungeon Keeper</span>
            <span className="logo-subtitle">RPG Manager</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="nav-container">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <img src={item.icon} alt={item.label} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="user-menu">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username || 'Usuário'}</span>
              <span className="user-role">Aventureiro</span>
            </div>
          </div>
          
          <div className="user-actions">
            <Link to="/profile" className="action-btn" title="Perfil">
              <img src="/icons/Heróis & Guerreiros.png" alt="Perfil" className="action-icon" />
            </Link>
            <Link to="/settings" className="action-btn" title="Configurações">
              <img src="/icons/Configuração.png" alt="Configurações" className="action-icon" />
            </Link>
            <button onClick={handleLogout} className="action-btn logout" title="Sair">
              <img src="/icons/Sair.png" alt="Sair" className="action-icon" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          
          <div className="mobile-user-actions">
            <Link to="/profile" className="mobile-action-link">
              <img src="/icons/Personagem-Máscara.png" alt="Perfil" className="w-4 h-4 inline mr-2" />
              Perfil
            </Link>
            <Link to="/settings" className="mobile-action-link">
              <img src="/icons/Configurações.png" alt="Configurações" className="w-4 h-4 inline mr-2" />
              Configurações
            </Link>
            <button onClick={handleLogout} className="mobile-action-link logout">
              <img src="/icons/Sair.png" alt="Sair" className="w-4 h-4 inline mr-2" />
              Sair
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <style>{`
        .modern-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--dk-border-light);
          transition: var(--dk-transition);
        }

        .modern-header.scrolled {
          background: rgba(10, 10, 10, 0.98);
          box-shadow: var(--dk-shadow);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--dk-space-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: var(--dk-space-md);
          text-decoration: none;
          transition: var(--dk-transition);
        }

        .logo-container:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          font-size: 2rem;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
          animation: float 3s ease-in-out infinite;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-family: var(--dk-font-display);
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--dk-gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--dk-text-muted);
          font-weight: 400;
        }

        .nav-container {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-list {
          display: flex;
          list-style: none;
          gap: var(--dk-space-sm);
          margin: 0;
          padding: 0;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--dk-space-sm);
          padding: var(--dk-space-sm) var(--dk-space-md);
          border-radius: var(--dk-radius-md);
          text-decoration: none;
          color: var(--dk-text-secondary);
          transition: var(--dk-transition);
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--dk-gradient-glass);
          transition: var(--dk-transition-slow);
        }

        .nav-link:hover::before,
        .nav-link.active::before {
          left: 0;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--dk-text-primary);
          background: var(--dk-bg-glass);
          border: 1px solid var(--dk-border-light);
        }

        .nav-link.active {
          background: var(--dk-gradient-glass);
          border-color: var(--dk-border);
          box-shadow: var(--dk-glow);
        }

        .nav-icon {
          font-size: 1.1rem;
          z-index: 1;
          position: relative;
        }

        .nav-label {
          font-weight: 500;
          font-size: 0.875rem;
          z-index: 1;
          position: relative;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--dk-space-md);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--dk-space-sm);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--dk-gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--dk-bg-primary);
          font-size: 1.1rem;
          box-shadow: var(--dk-shadow);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: var(--dk-text-primary);
          font-size: 0.875rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--dk-text-muted);
        }

        .user-actions {
          display: flex;
          gap: var(--dk-space-xs);
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--dk-radius-md);
          background: transparent;
          border: 1px solid var(--dk-border-light);
          color: var(--dk-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: var(--dk-transition);
          cursor: pointer;
          font-size: 1rem;
        }

        .action-btn:hover {
          background: var(--dk-bg-glass);
          border-color: var(--dk-border);
          color: var(--dk-text-primary);
          transform: translateY(-2px);
        }

        .action-btn.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--dk-space-sm);
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: var(--dk-transition);
        }

        .hamburger span {
          width: 24px;
          height: 2px;
          background: var(--dk-text-primary);
          transition: var(--dk-transition);
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--dk-border-light);
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
          transition: var(--dk-transition);
        }

        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .mobile-nav {
          padding: var(--dk-space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--dk-space-sm);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: var(--dk-space-md);
          padding: var(--dk-space-md);
          border-radius: var(--dk-radius-md);
          text-decoration: none;
          color: var(--dk-text-secondary);
          transition: var(--dk-transition);
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: var(--dk-bg-glass);
          color: var(--dk-text-primary);
        }

        .mobile-user-actions {
          margin-top: var(--dk-space-lg);
          padding-top: var(--dk-space-lg);
          border-top: 1px solid var(--dk-border-light);
          display: flex;
          flex-direction: column;
          gap: var(--dk-space-sm);
        }

        .mobile-action-link {
          display: flex;
          align-items: center;
          gap: var(--dk-space-md);
          padding: var(--dk-space-md);
          border-radius: var(--dk-radius-md);
          text-decoration: none;
          color: var(--dk-text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: var(--dk-transition);
          width: 100%;
          text-align: left;
        }

        .mobile-action-link:hover {
          background: var(--dk-bg-glass);
          color: var(--dk-text-primary);
        }

        .mobile-action-link.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: -1;
        }

        @media (max-width: 768px) {
          .nav-container,
          .user-info,
          .user-actions {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .header-container {
            padding: 0 var(--dk-space-md);
          }

          .logo-text {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            height: 60px;
          }

          .logo-icon {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </header>
  );
}

export default ModernHeader;