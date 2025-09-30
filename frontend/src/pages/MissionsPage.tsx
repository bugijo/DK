import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';

// Componentes de ícones SVG
const TargetIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SwordIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const TreasureIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CoinsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  maxProgress: number;
  rewards: {
    gold: number;
    experience: number;
    items?: string[];
  };
  timeLimit?: string;
  requirements?: string[];
}

const mockMissions: Mission[] = [
  {
    id: '1',
    title: 'Primeira Aventura',
    description: 'Complete sua primeira sessão de RPG em uma mesa.',
    type: 'story',
    difficulty: 'easy',
    status: 'available',
    progress: 0,
    maxProgress: 1,
    rewards: {
      gold: 100,
      experience: 50,
      items: ['Poção de Cura']
    }
  },
  {
    id: '2',
    title: 'Colecionador de Personagens',
    description: 'Crie 3 personagens diferentes.',
    type: 'daily',
    difficulty: 'easy',
    status: 'in_progress',
    progress: 1,
    maxProgress: 3,
    rewards: {
      gold: 150,
      experience: 75
    },
    timeLimit: '23:45:30'
  },
  {
    id: '3',
    title: 'Mestre das Compras',
    description: 'Compre 5 itens na loja do aventureiro.',
    type: 'weekly',
    difficulty: 'medium',
    status: 'available',
    progress: 0,
    maxProgress: 5,
    rewards: {
      gold: 300,
      experience: 150,
      items: ['Anel de Proteção']
    },
    timeLimit: '6 dias, 12:30:15'
  },
  {
    id: '4',
    title: 'Lenda Viva',
    description: 'Alcance o nível 20 com qualquer personagem.',
    type: 'special',
    difficulty: 'legendary',
    status: 'available',
    progress: 12,
    maxProgress: 20,
    rewards: {
      gold: 1000,
      experience: 500,
      items: ['Espada Lendária', 'Armadura Épica']
    },
    requirements: ['Ter pelo menos um personagem nível 10']
  },
  {
    id: '5',
    title: 'Explorador de Histórias',
    description: 'Participe de 10 sessões diferentes.',
    type: 'story',
    difficulty: 'hard',
    status: 'completed',
    progress: 10,
    maxProgress: 10,
    rewards: {
      gold: 500,
      experience: 250
    }
  }
];

const difficultyColors = {
  easy: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  hard: 'text-red-600 bg-red-100',
  legendary: 'text-purple-600 bg-purple-100'
};

const typeColors = {
  daily: 'text-blue-600 bg-blue-100',
  weekly: 'text-indigo-600 bg-indigo-100',
  story: 'text-green-600 bg-green-100',
  special: 'text-purple-600 bg-purple-100'
};

const statusColors = {
  available: 'text-gray-600 bg-gray-100',
  in_progress: 'text-blue-600 bg-blue-100',
  completed: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100'
};

export function MissionsPage() {
  const { user } = useAuthContext();
  const { showSuccess, showError } = useToastContext();
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredMissions = missions.filter(mission => {
    const matchesType = selectedType === 'all' || mission.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || mission.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const handleAcceptMission = (mission: Mission) => {
    if (mission.status !== 'available') {
      showError('Erro', 'Esta missão não está disponível!');
      return;
    }

    setMissions(prev => prev.map(m => 
      m.id === mission.id ? { ...m, status: 'in_progress' as const } : m
    ));
    showSuccess('Sucesso', `Missão "${mission.title}" aceita!`);
  };

  const handleClaimReward = (mission: Mission) => {
    if (mission.status !== 'completed') {
      showError('Erro', 'Esta missão ainda não foi completada!');
      return;
    }

    showSuccess('Recompensa!', `Você recebeu ${mission.rewards.gold} ouro e ${mission.rewards.experience} XP!`);
  };

  const getProgressPercentage = (mission: Mission) => {
    return (mission.progress / mission.maxProgress) * 100;
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-title text-5xl font-bold text-primary">MISSÕES E DESAFIOS</h2>
      </div>
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary"
          >
            <option value="all">Todos os Tipos</option>
            <option value="daily">Diárias</option>
            <option value="weekly">Semanais</option>
            <option value="story">História</option>
            <option value="special">Especiais</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary"
          >
            <option value="all">Todos os Status</option>
            <option value="available">Disponível</option>
            <option value="in_progress">Em Progresso</option>
            <option value="completed">Completada</option>
            <option value="failed">Falhada</option>
          </select>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMissions.map((mission) => (
            <div
              key={mission.id}
              className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:border-primary/60 shadow-lg"
            >
              {/* Mission Header */}
              <div className="p-6 border-b border-secondary/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-title text-xl text-primary mb-2">
                      {mission.title}
                    </h3>
                    <p className="font-body text-sm text-text-base">
                      {mission.description}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[mission.type]}`}>
                      {mission.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[mission.difficulty]}`}>
                      {mission.difficulty}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-base">
                      Progresso
                    </span>
                    <span className="text-sm text-text-muted">
                      {mission.progress}/{mission.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-surface/50 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(mission)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Time Limit */}
                {mission.timeLimit && (
                  <div className="flex items-center space-x-2 text-sm text-text-muted mb-4">
                    <ClockIcon />
                    <span>Tempo restante: {mission.timeLimit}</span>
                  </div>
                )}

                {/* Requirements */}
                {mission.requirements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-text-base mb-2">
                      Requisitos:
                    </h4>
                    <ul className="text-sm text-text-muted space-y-1">
                      {mission.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mission Footer */}
              <div className="p-6 flex-grow">
                {/* Rewards */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-text-base mb-2">
                    Recompensas:
                  </h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-primary">
                      <CoinsIcon />
                      <span>{mission.rewards.gold} Ouro</span>
                    </div>
                    <div className="text-secondary">
                      <span>{mission.rewards.experience} XP</span>
                    </div>
                    {mission.rewards.items && (
                      <div className="text-primary">
                        <span>{mission.rewards.items.length} Item(s)</span>
                      </div>
                    )}
                  </div>
                  {mission.rewards.items && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {mission.rewards.items.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-2 bg-background/50 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[mission.status]}`}>
                  {mission.status === 'available' && 'Disponível'}
                  {mission.status === 'in_progress' && 'Em Progresso'}
                  {mission.status === 'completed' && 'Completada'}
                  {mission.status === 'failed' && 'Falhada'}
                </span>
                
                {mission.status === 'available' && (
                  <button
                    onClick={() => handleAcceptMission(mission)}
                    className="px-4 py-2 bg-primary/80 hover:bg-primary text-background rounded font-bold text-sm transition-colors"
                  >
                    Aceitar Missão
                  </button>
                )}
                
                {mission.status === 'completed' && (
                  <button
                    onClick={() => handleClaimReward(mission)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-sm transition-colors"
                  >
                    Coletar Recompensa
                  </button>
                )}
                
                {mission.status === 'in_progress' && (
                  <div className="text-sm text-text-muted">
                    Em andamento...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 text-text-muted mx-auto mb-4">
              <TargetIcon />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              Nenhuma missão encontrada
            </h3>
            <p className="text-text-muted">
              Tente ajustar os filtros para encontrar missões.
            </p>
          </div>
        )}
    </>
  );
}

export default MissionsPage;