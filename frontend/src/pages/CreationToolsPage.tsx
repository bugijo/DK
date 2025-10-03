import React from 'react';
import { Link } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';

// Componente de card de ferramenta melhorado
const ToolCard = ({ 
  to, 
  title, 
  description, 
  icon, 
  isAvailable = true,
  comingSoon = false 
}: { 
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isAvailable?: boolean;
  comingSoon?: boolean;
}) => {
  const { showInfo } = useToastContext();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAvailable || comingSoon) {
      e.preventDefault();
      showInfo('Em Breve', 'Esta funcionalidade estará disponível em breve!');
    }
  };

  const cardContent = (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br from-gray-800/90 to-gray-900/90 
      backdrop-blur-sm border-2 rounded-xl p-8 shadow-2xl 
      transition-all duration-300 transform
      ${
        isAvailable && !comingSoon
          ? 'border-amber-500/30 hover:border-amber-400/60 hover:scale-105 hover:shadow-amber-500/20 cursor-pointer'
          : 'border-gray-600/30 opacity-75 cursor-not-allowed'
      }
    `}>
      {/* Efeito de brilho de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Badge "Em Breve" */}
      {comingSoon && (
        <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
          EM BREVE
        </div>
      )}
      
      <div className="relative flex flex-col items-center text-center space-y-6">
        {/* Ícone com efeito de hover */}
        <div className={`
          p-6 rounded-full transition-all duration-300
          ${
            isAvailable && !comingSoon
              ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 group-hover:from-amber-400/30 group-hover:to-amber-500/20'
              : 'bg-gray-700/30'
          }
        `}>
          <div className={`
            transition-all duration-300
            ${
              isAvailable && !comingSoon
                ? 'filter brightness-110 hover:brightness-125 hover:drop-shadow-lg'
                : 'filter brightness-75 grayscale-50'
            }
          `}>
            {icon}
          </div>
        </div>
        
        {/* Título */}
        <h3 className={`
          font-title text-2xl font-bold transition-colors duration-300
          ${
            isAvailable && !comingSoon
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-gray-500'
          }
        `}>
          {title}
        </h3>
        
        {/* Descrição */}
        <p className={`
          text-base leading-relaxed transition-colors duration-300
          ${
            isAvailable && !comingSoon
              ? 'text-gray-300 hover:text-gray-200'
              : 'text-gray-500'
          }
        `}>
          {description}
        </p>
        
        {/* Indicador de status */}
        {isAvailable && !comingSoon && (
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Disponível</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isAvailable && !comingSoon) {
    return (
      <Link to={to} className="group">
        {cardContent}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className="group">
      {cardContent}
    </div>
  );
};

export function CreationToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Épico */}
        <div className="text-center mb-16">
          <div className="relative">
            <h1 className="font-title text-7xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
              <img src="/icons/Equipamentos.png" alt="Ferramentas" style={{width: '48px', height: '48px', display: 'inline', marginRight: '16px'}} /> ARSENAL DO CRIADOR <img src="/icons/Equipamentos.png" alt="Ferramentas" style={{width: '48px', height: '48px', display: 'inline', marginLeft: '16px'}} />
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent blur-sm opacity-30 font-title text-7xl font-bold">
              <img src="/icons/Equipamentos.png" alt="Ferramentas" style={{width: '48px', height: '48px', display: 'inline', marginRight: '16px'}} /> ARSENAL DO CRIADOR <img src="/icons/Equipamentos.png" alt="Ferramentas" style={{width: '48px', height: '48px', display: 'inline', marginLeft: '16px'}} />
            </div>
          </div>
          
          <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Domine as ferramentas definitivas para criar mundos épicos.
            Forje personagens, criaturas, itens e histórias que marcarão suas campanhas para sempre.
          </p>
          
          {/* Linha decorativa animada */}
          <div className="relative w-64 h-1 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-pulse"></div>
          </div>
          
          {/* Estatísticas */}
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>12 Ferramentas Disponíveis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>5 Categorias Organizadas</span>
            </div>
          </div>
        </div>

        {/* Grid de Ferramentas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* === CRIAÇÃO DE CONTEÚDO === */}
          <ToolCard 
            to="/tools/items" 
            title="Gerenciar Itens" 
            description="Forje armas lendárias, armaduras místicas e artefatos mágicos únicos para suas aventuras." 
            icon={
              <img 
                src="/icons/Equipamentos.svg" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Equipamentos"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />
          
          <ToolCard 
            to="/tools/monsters" 
            title="Gerenciar Monstros" 
            description="Conjure criaturas temíveis e aliados poderosos para povoar seus mundos fantásticos." 
            icon={
              <img 
                src="/icons/Monstros.svg" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Monstros"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />
          
          <ToolCard 
            to="/tools/npcs" 
            title="Gerenciar NPCs" 
            description="Crie personagens memoráveis com histórias ricas e personalidades cativantes." 
            icon={
              <img 
                src="/icons/NPC.svg" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="NPCs"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />
          
          <ToolCard 
            to="/tools/stories" 
            title="Gerenciar Histórias" 
            description="Tece narrativas épicas que conectam todos os elementos de seu universo." 
            icon={
              <img 
                src="/icons/Gerenciar Histórias.png" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Histórias"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          {/* === GESTÃO DE MESAS === */}
          <ToolCard 
            to="/tools/tables" 
            title="Sistema de Mesas" 
            description="Crie e gerencie mesas de RPG com controle de níveis, solicitações e aprovações." 
            icon={
              <img 
                src="/icons/Mesas.svg" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Mesas"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          <ToolCard 
            to="/tools/quests" 
            title="Gerenciar Quests" 
            description="Desenvolva missões épicas com objetivos, recompensas e progressão dinâmica." 
            icon={
              <img 
                src="/icons/Missoes.svg" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Quests"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          {/* === FERRAMENTAS DE MESA === */}
          <ToolCard 
            to="/tools/dice" 
            title="Sistema de Dados" 
            description="Rolagem avançada de dados com histórico, modificadores e resultados automáticos." 
            icon={
              <img 
                src="/icons/Dados.png" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Dados"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          <ToolCard 
            to="/tools/notes" 
            title="Anotações Rápidas" 
            description="Sistema de notas colaborativas para mestres e jogadores durante as sessões." 
            icon={
              <img 
                src="/icons/Anotações Rápidas.png" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Anotações"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          {/* === MUNDO E AMBIENTE === */}
          <ToolCard 
            to="/tools/maps" 
            title="Gerenciar Mapas" 
            description="Crie e organize mapas interativos para suas campanhas e explorações." 
            icon={
              <img 
                src="/icons/Mapa.svg" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Mapas"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          <ToolCard 
            to="/tools/world" 
            title="Mundo Dinâmico" 
            description="Construa civilizações, eventos e um mundo que evolui com as ações dos jogadores." 
            icon={
              <img 
                src="/icons/Âncora.png" 
                className="h-16 w-16 filter drop-shadow-lg" 
                alt="Mundo"
                style={{
                  filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                }}
              />
            }
            isAvailable={true}
          />

          {/* === COMUNICAÇÃO === */}
          <ToolCard 
            to="/tools/chat" 
            title="Chat de Mesa" 
            description="Sistema de comunicação em tempo real para coordenação durante as sessões." 
            icon={
              <div className="text-6xl filter drop-shadow-lg" style={{ filter: 'brightness(1.3)' }}>
                💬
              </div>
            }
            isAvailable={true}
          />

          <ToolCard 
            to="/tools/calendar" 
            title="Calendário & Eventos" 
            description="Organize sessões, lembretes e eventos importantes da campanha." 
            icon={
              <div className="text-6xl filter drop-shadow-lg" style={{ filter: 'brightness(1.3)' }}>
                <img src="/icons/Sistema de Dados.png" alt="Data" style={{width: '16px', height: '16px'}} />
              </div>
            }
            isAvailable={true}
          />
          

        </div>
        

      </div>
    </div>
  );
}