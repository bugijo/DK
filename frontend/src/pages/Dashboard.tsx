import React from 'react';
import { Link } from 'react-router-dom';

const cardData = [
  { link: "/tables", icon: "/icons/Mesas de Aventura.png", title: 'MESAS DE AVENTURA', description: 'Gerencie e participe de épicas jornadas de RPG', buttonText: 'EXPLORAR MESAS' },
  { link: "/characters", icon: "/icons/Heróis & Guerreiros.png", title: 'HERÓIS & GUERREIROS', description: 'Crie e desenvolva seus personagens lendários', buttonText: 'CRIAR HERÓI' },
  { link: "/missions", icon: "/icons/Missões Épicas.png", title: 'MISSÕES ÉPICAS', description: 'Complete desafios e conquiste glória eterna', buttonText: 'ACEITAR MISSÃO' },
  { link: "/inventory", icon: "/icons/Arsenal & Tesouros.png", title: 'ARSENAL & TESOUROS', description: 'Gerencie armas, armaduras e itens mágicos', buttonText: 'VER ARSENAL' },
  { link: "/tools", icon: "/icons/Forja do Mestre.png", title: 'FORJA DO MESTRE', description: 'Ferramentas para criar mundos fantásticos', buttonText: 'ENTRAR NA FORJA' },
  { link: "/store", icon: "/icons/Mercado Medieval.png", title: 'MERCADO MEDIEVAL', description: 'Adquira equipamentos e recursos raros', buttonText: 'VISITAR MERCADO' },
];

// Componente de Card Medieval
interface MedievalCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
}

function MedievalCard({ icon, title, description, buttonText, link }: MedievalCardProps) {
  return (
    <Link to={link} className="block group">
      <div className="medieval-card">
        <div className="card-border">
          <div className="card-content">
            <div className="card-icon">
              <img src={icon} alt={title} className="icon-symbol" />
            </div>
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
            <button className="medieval-button">
              <span className="button-text">{buttonText}</span>
              <span className="button-arrow">⟶</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Dashboard() {
  return (
    <div className="medieval-dashboard">
      {/* Header Medieval */}
      <header className="dashboard-header">
        <div className="header-ornament top"></div>
        <div className="header-content">
          <div className="logo-container">
            <img src="/logo-principal.png" alt="Dungeon Keeper" className="main-logo" />
          </div>
          <h1 className="main-title">
            <span className="title-line-1"><img src="/icons/Coroa.png" alt="Coroa" style={{width: '24px', height: '24px', display: 'inline', marginRight: '8px'}} /> BEM-VINDO AO <img src="/icons/Coroa.png" alt="Coroa" style={{width: '24px', height: '24px', display: 'inline', marginLeft: '8px'}} /></span>
            <span className="title-line-2">DUNGEON KEEPER</span>
            <span className="title-subtitle">~ Reino das Aventuras Épicas ~</span>
          </h1>
        </div>
        <div className="header-ornament bottom"></div>
      </header>

      {/* Grid de Cards */}
      <main className="cards-container">
        <div className="cards-grid">
          {cardData.map((card, index) => (
            <div key={card.title} className="card-wrapper" style={{ animationDelay: `${index * 0.1}s` }}>
              <MedievalCard {...card} />
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .medieval-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #1a1a1a 50%, #2d1810 75%, #1a1a1a 100%);
          background-size: 400% 400%;
          animation: medievalGradient 20s ease infinite;
          position: relative;
          overflow-x: hidden;
        }

        .medieval-dashboard::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(184, 148, 31, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        @keyframes medievalGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Header Medieval */
        .dashboard-header {
          text-align: center;
          padding: 4rem 2rem 3rem;
          position: relative;
          z-index: 1;
        }

        .header-ornament {
          height: 3px;
          background: linear-gradient(90deg, transparent, #d4af37, #b8941f, #d4af37, transparent);
          margin: 2rem auto;
          max-width: 600px;
          position: relative;
        }

        .header-ornament::before,
        .header-ornament::after {
          content: '❦';
          position: absolute;
          top: -8px;
          color: #d4af37;
          font-size: 1.2rem;
        }

        .header-ornament::before { left: -20px; }
        .header-ornament::after { right: -20px; }

        .logo-container {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .main-logo {
          max-height: 120px;
          max-width: 300px;
          width: auto;
          height: auto;
          filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.6));
          transition: all 0.3s ease;
        }

        .main-logo:hover {
          filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.8));
          transform: scale(1.05);
        }

        .main-title {
          font-family: 'Cinzel', serif;
          margin: 1rem 0;
        }

        .title-line-1 {
          display: block;
          font-size: 1.5rem;
          color: #d4af37;
          font-weight: 400;
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        .title-line-2 {
          display: block;
          font-size: 4rem;
          font-weight: 700;
          background: linear-gradient(45deg, #d4af37, #f4e4a6, #d4af37, #b8941f);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
          letter-spacing: 0.1em;
          text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
          margin-bottom: 0.5rem;
        }

        .title-subtitle {
          display: block;
          font-size: 1.2rem;
          color: #a8a29e;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.15em;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Cards Container */
        .cards-container {
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .card-wrapper {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Medieval Card */
        .medieval-card {
          position: relative;
          height: 100%;
          transition: all 0.3s ease;
        }

        .medieval-card:hover {
          transform: translateY(-8px);
        }

        .card-border {
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
          border: 2px solid #d4af37;
          border-radius: 15px;
          padding: 3px;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .card-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #d4af37, transparent, #d4af37);
          border-radius: 15px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .medieval-card:hover .card-border::before {
          opacity: 1;
        }

        .card-content {
          background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
          border-radius: 12px;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .card-content::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          pointer-events: none;
        }

        .card-icon {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .icon-symbol {
          font-size: 3.5rem;
          filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.6));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .card-title {
          font-family: 'Cinzel', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #d4af37;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .card-description {
          color: #d1ccc0;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          flex-grow: 1;
        }

        .medieval-button {
          background: linear-gradient(145deg, #d4af37, #b8941f);
          border: none;
          border-radius: 25px;
          padding: 0.8rem 2rem;
          color: #1a1a1a;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .medieval-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .medieval-button:hover::before {
          left: 100%;
        }

        .medieval-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
        }

        .button-text {
          position: relative;
          z-index: 1;
        }

        .button-arrow {
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease;
        }

        .medieval-button:hover .button-arrow {
          transform: translateX(3px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 2rem 1rem;
          }

          .main-logo {
            max-height: 80px;
            max-width: 200px;
          }

          .title-line-2 {
            font-size: 2.5rem;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 0 1rem;
          }

          .card-content {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .main-logo {
            max-height: 60px;
            max-width: 150px;
          }

          .title-line-1 {
            font-size: 1.2rem;
          }

          .title-line-2 {
            font-size: 2rem;
          }

          .title-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}