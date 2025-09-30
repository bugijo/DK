// frontend/src/components/ModernCard.tsx
import React, { ReactNode } from 'react';

interface ModernCardProps {
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'glow' | 'hover-lift';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  icon?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function ModernCard({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  interactive = false,
  onClick,
  header,
  footer,
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'primary'
}: ModernCardProps) {
  const cardClasses = [
    'modern-card',
    `card-${variant}`,
    `card-${size}`,
    interactive ? 'card-interactive' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      {(header || title || icon || badge) && (
        <div className="card-header">
          <div className="card-header-content">
            {icon && <div className="card-icon">{icon}</div>}
            <div className="card-title-section">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {badge && (
            <div className={`card-badge badge-${badgeColor}`}>
              {badge}
            </div>
          )}
          {header}
        </div>
      )}

      {/* Content */}
      {children && (
        <div className="card-content">
          {children}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}

      {/* Decorative Elements */}
      <div className="card-decoration">
        <div className="decoration-corner decoration-top-left"></div>
        <div className="decoration-corner decoration-top-right"></div>
        <div className="decoration-corner decoration-bottom-left"></div>
        <div className="decoration-corner decoration-bottom-right"></div>
      </div>

      <style>{`
        .modern-card {
          position: relative;
          border-radius: var(--dk-radius-lg);
          transition: var(--dk-transition);
          overflow: hidden;
          isolation: isolate;
        }

        /* Variants */
        .card-default {
          background: var(--dk-gradient-card);
          border: 1px solid var(--dk-border-light);
          box-shadow: var(--dk-shadow);
        }

        .card-glass {
          background: var(--dk-gradient-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--dk-border-light);
          box-shadow: var(--dk-shadow);
        }

        .card-gradient {
          background: linear-gradient(145deg, 
            rgba(212, 175, 55, 0.1) 0%, 
            rgba(139, 69, 19, 0.1) 50%, 
            rgba(255, 107, 53, 0.1) 100%);
          border: 1px solid var(--dk-border);
          box-shadow: var(--dk-shadow-lg);
        }

        .card-glow {
          background: var(--dk-gradient-card);
          border: 1px solid var(--dk-primary);
          box-shadow: var(--dk-shadow), var(--dk-glow);
          animation: glow 3s ease-in-out infinite;
        }

        .card-hover-lift {
          background: var(--dk-gradient-card);
          border: 1px solid var(--dk-border-light);
          box-shadow: var(--dk-shadow);
          transform: translateY(0);
        }

        /* Sizes */
        .card-sm {
          padding: var(--dk-space-md);
        }

        .card-md {
          padding: var(--dk-space-lg);
        }

        .card-lg {
          padding: var(--dk-space-xl);
        }

        .card-xl {
          padding: var(--dk-space-2xl);
        }

        /* Interactive States */
        .card-interactive:hover,
        .card-clickable:hover {
          transform: translateY(-4px);
          box-shadow: var(--dk-shadow-lg);
          border-color: var(--dk-border);
        }

        .card-hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: var(--dk-shadow-lg), 0 0 40px rgba(212, 175, 55, 0.2);
        }

        .card-clickable {
          cursor: pointer;
        }

        .card-clickable:active {
          transform: translateY(-2px);
        }

        /* Header */
        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--dk-space-lg);
          padding-bottom: var(--dk-space-md);
          border-bottom: 1px solid var(--dk-border-light);
        }

        .card-header-content {
          display: flex;
          align-items: flex-start;
          gap: var(--dk-space-md);
          flex: 1;
        }

        .card-icon {
          font-size: 2rem;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
          animation: float 4s ease-in-out infinite;
        }

        .card-title-section {
          flex: 1;
        }

        .card-title {
          font-family: var(--dk-font-display);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--dk-text-primary);
          margin: 0 0 var(--dk-space-xs) 0;
          background: var(--dk-gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-subtitle {
          font-size: 0.875rem;
          color: var(--dk-text-muted);
          margin: 0;
          line-height: 1.4;
        }

        .card-badge {
          padding: var(--dk-space-xs) var(--dk-space-sm);
          border-radius: var(--dk-radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-primary {
          background: var(--dk-gradient-primary);
          color: var(--dk-bg-primary);
        }

        .badge-secondary {
          background: var(--dk-bg-tertiary);
          color: var(--dk-text-secondary);
          border: 1px solid var(--dk-border);
        }

        .badge-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .badge-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .badge-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        /* Content */
        .card-content {
          color: var(--dk-text-secondary);
          line-height: 1.6;
        }

        /* Footer */
        .card-footer {
          margin-top: var(--dk-space-lg);
          padding-top: var(--dk-space-md);
          border-top: 1px solid var(--dk-border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--dk-space-md);
        }

        /* Decorative Elements */
        .card-decoration {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: var(--dk-transition);
        }

        .modern-card:hover .card-decoration {
          opacity: 1;
        }

        .decoration-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid var(--dk-primary);
          transition: var(--dk-transition);
        }

        .decoration-top-left {
          top: var(--dk-space-md);
          left: var(--dk-space-md);
          border-right: none;
          border-bottom: none;
        }

        .decoration-top-right {
          top: var(--dk-space-md);
          right: var(--dk-space-md);
          border-left: none;
          border-bottom: none;
        }

        .decoration-bottom-left {
          bottom: var(--dk-space-md);
          left: var(--dk-space-md);
          border-right: none;
          border-top: none;
        }

        .decoration-bottom-right {
          bottom: var(--dk-space-md);
          right: var(--dk-space-md);
          border-left: none;
          border-top: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            gap: var(--dk-space-md);
          }

          .card-header-content {
            width: 100%;
          }

          .card-icon {
            font-size: 1.5rem;
          }

          .card-title {
            font-size: 1.125rem;
          }

          .decoration-corner {
            width: 15px;
            height: 15px;
          }
        }

        /* Focus States */
        .card-clickable:focus {
          outline: 2px solid var(--dk-primary);
          outline-offset: 2px;
        }

        /* Loading State */
        .card-loading {
          position: relative;
          overflow: hidden;
        }

        .card-loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 175, 55, 0.1),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ModernCard;