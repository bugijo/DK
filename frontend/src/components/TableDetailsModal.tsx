import React, { useState, useEffect } from 'react';
import type { TableData, CharacterData } from '../services/api';
import { requestToJoinTable, approveJoinRequest, declineJoinRequest, getUserCharacters } from '../services/api';
import { useToastContext } from '../contexts/ToastContext';
import { useAuthContext } from '../contexts/AuthContext';

interface TableDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableData | null;
  isOwner: boolean;
  onAction: () => void; // Callback para atualizar os dados na página pai
}

export function TableDetailsModal({ isOpen, onClose, table, isOwner, onAction }: TableDetailsModalProps) {
  const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [message, setMessage] = useState('');
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const { user } = useAuthContext();

  // Carrega personagens do usuário quando abre o modal
  useEffect(() => {
    if (isOpen && !isOwner && table) {
      loadUserCharacters();
    }
  }, [isOpen, isOwner, table]);

  const loadUserCharacters = async () => {
    setLoadingCharacters(true);
    try {
      const userCharacters = await getUserCharacters();
      setCharacters(userCharacters);
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
      showError('Erro', 'Não foi possível carregar seus personagens');
    } finally {
      setLoadingCharacters(false);
    }
  };

  const getEligibleCharacters = () => {
    if (!table) return characters;
    
    return characters.filter(character => {
      if (table.min_character_level && character.level < table.min_character_level) {
        return false;
      }
      if (table.max_character_level && character.level > table.max_character_level) {
        return false;
      }
      return true;
    });
  };

  const handleJoinRequest = async () => {
    if (!table?.id || !selectedCharacter) {
      showError('Erro', 'Selecione um personagem para continuar');
      return;
    }
    
    setRequestState('loading');
    try {
      await requestToJoinTable({
        table_id: table.id,
        character_id: selectedCharacter,
        message: message.trim() || undefined
      });
      setRequestState('success');
      showSuccess('Solicitação Enviada', 'Sua solicitação foi enviada ao mestre da mesa!');
      setShowJoinForm(false);
      setTimeout(() => onAction(), 1500);
    } catch (error: any) {
      console.error('Erro na solicitação:', error);
      setRequestState('error');
      showError('Erro', error.response?.data?.detail || 'Erro ao enviar solicitação');
    }
  };
  
  const handleManageRequest = async (requestId: string, action: 'approve' | 'decline') => {
    try {
      if (action === 'approve') {
        await approveJoinRequest(requestId);
        showSuccess('Solicitação Aprovada', 'Jogador foi aprovado para a mesa!');
      } else {
        await declineJoinRequest(requestId);
        showSuccess('Solicitação Recusada', 'Solicitação foi recusada');
      }
      onAction();
    } catch (error: any) {
      console.error(`Erro ao ${action} solicitação:`, error);
      showError('Erro', `Erro ao ${action === 'approve' ? 'aprovar' : 'recusar'} solicitação`);
    }
  };

  if (!isOpen || !table) return null;

  const eligibleCharacters = getEligibleCharacters();
  const isUserAlreadyPlayer = table.players?.some(player => player.id === user?.id);
  const hasExistingRequest = table.join_requests?.some(req => req.user_id === user?.id && req.status === 'pending');

  const renderLevelRequirements = () => {
    if (!table.min_character_level && !table.max_character_level) return null;
    
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-amber-300 mb-2">📋 Requisitos de Nível</h4>
        <div className="text-sm text-amber-200">
          {table.min_character_level && (
            <p>• Nível mínimo: {table.min_character_level}</p>
          )}
          {table.max_character_level && (
            <p>• Nível máximo: {table.max_character_level}</p>
          )}
        </div>
      </div>
    );
  };

  const renderJoinForm = () => {
    if (!showJoinForm) return null;

    return (
      <div className="bg-background/50 rounded-lg p-6 mt-4 border border-secondary/30">
        <h4 className="font-title text-lg text-primary mb-4">Solicitar Entrada na Mesa</h4>
        
        {renderLevelRequirements()}
        
        {loadingCharacters ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Carregando personagens...</p>
          </div>
        ) : eligibleCharacters.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-400 mb-2"><img src="/icons/Cancelar.png" alt="Erro" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Nenhum personagem elegível</p>
            <p className="text-sm text-gray-400">
              {table.min_character_level || table.max_character_level
                ? 'Seus personagens não atendem aos requisitos de nível desta mesa.'
                : 'Você não possui personagens criados.'}
            </p>
            <button
              onClick={() => setShowJoinForm(false)}
              className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-300 font-semibold mb-2">
                Escolha seu Personagem
              </label>
              <select
                value={selectedCharacter}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              >
                <option value="">Selecione um personagem...</option>
                {eligibleCharacters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name} - Nível {character.level} ({character.race} {character.character_class})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-semibold mb-2">
                Mensagem para o Mestre (Opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte um pouco sobre sua experiência, estilo de jogo ou qualquer informação relevante..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{message.length}/500 caracteres</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoinRequest}
                disabled={!selectedCharacter || requestState === 'loading'}
                className="flex-1 bg-primary hover:bg-primary/90 text-background font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestState === 'loading' ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderJoinButton = () => {
    if (isUserAlreadyPlayer) {
      return (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-lg text-center">
          <img src="/icons/Concluído.png" alt="Sucesso" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Você já é jogador desta mesa
        </div>
      );
    }

    if (hasExistingRequest) {
      return (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 p-4 rounded-lg text-center">
          ⏳ Solicitação pendente - Aguardando aprovação do mestre
        </div>
      );
    }

    if (table.players && table.players.length >= table.max_players) {
      return (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-center">
          🚫 Mesa lotada ({table.max_players} jogadores máximo)
        </div>
      );
    }

    switch (requestState) {
      case 'success':
        return (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-lg text-center">
            <img src="/icons/Concluído.png" alt="Sucesso" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Solicitação enviada com sucesso!
          </div>
        );
      default:
        return (
          <button
            onClick={() => setShowJoinForm(true)}
            className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-3 px-8 rounded-lg transition-colors"
          >
            <img src="/icons/Dados.png" alt="Dados" className="w-4 h-4 inline mr-2" />Solicitar Vaga
          </button>
        );
    }
  };

  const renderManagementSection = () => (
    <>
      <h3 className="font-title text-xl text-primary/90 mt-6 mb-4 flex items-center">
        <span className="mr-2">📋</span>
        Solicitações Pendentes
      </h3>
      {table?.join_requests && table.join_requests.length > 0 ? (
        <div className="space-y-3">
          {table.join_requests
            .filter(req => req.status === 'pending')
            .map((req) => (
            <div key={req.id} className="bg-background/50 border border-secondary/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-white">
                    {req.user?.username || 'Usuário'}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Personagem: {req.character?.name} (Nível {req.character?.level})
                  </p>
                  <p className="text-xs text-gray-500">
                    {req.character?.race} {req.character?.character_class}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleManageRequest(req.id, 'approve')}
                    className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-4 rounded transition-colors"
                  >
                    <img src="/icons/Concluído.png" alt="Aprovar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Aprovar
                  </button>
                  <button
                    onClick={() => handleManageRequest(req.id, 'decline')}
                    className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2 px-4 rounded transition-colors"
                  >
                    <img src="/icons/Deletar.png" alt="Recusar" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Recusar
                  </button>
                </div>
              </div>
              {req.message && (
                <div className="bg-gray-700/50 rounded p-3 mt-3">
                  <p className="text-sm text-gray-300">
                    <strong>Mensagem:</strong> {req.message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-sm bg-background/30 p-4 rounded-lg text-center">
          Nenhuma solicitação pendente.
        </p>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-lg p-8 w-full max-w-4xl border border-secondary/50 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-title text-3xl text-primary mb-2">{table.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-text-muted">
              <span><img src="/icons/Sistema de Dados.png" alt="Sistema" className="w-4 h-4 inline mr-1" />{table.system}</span>
              <span><img src="/icons/Coroa.png" alt="Mestre" className="w-4 h-4 inline mr-1" />Mestre: {table.master?.username || table.master_id}</span>
              {table.scheduled_date && (
                <span><img src="/icons/Dados.png" alt="Data" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />{new Date(table.scheduled_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted text-3xl hover:text-white transition-colors">
            &times;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center bg-background/50 p-4 rounded-lg">
            <p className="font-bold text-2xl text-primary">{table.players?.length || 0}</p>
            <p className="text-text-muted text-sm">Jogadores Aprovados</p>
          </div>
          <div className="text-center bg-background/50 p-4 rounded-lg">
            <p className="font-bold text-2xl text-primary">{table.max_players}</p>
            <p className="text-text-muted text-sm">Máximo de Jogadores</p>
          </div>
          <div className="text-center bg-background/50 p-4 rounded-lg">
            <p className="font-bold text-2xl text-primary">{table.join_requests?.filter(req => req.status === 'pending').length || 0}</p>
            <p className="text-text-muted text-sm">Solicitações Pendentes</p>
          </div>
        </div>

        {table.campaign_description && (
          <>
            <h3 className="font-title text-xl text-primary/90 mb-3 flex items-center">
              <span className="mr-2">📖</span>
              Descrição da Campanha
            </h3>
            <p className="text-text-base mb-6 bg-background/30 p-4 rounded-lg leading-relaxed">
              {table.campaign_description}
            </p>
          </>
        )}
        
        <h3 className="font-title text-xl text-primary/90 mb-3 flex items-center">
          <img src="/icons/Heróis & Guerreiros.png" alt="Jogadores" className="w-5 h-5 mr-2" />
          Jogadores Confirmados
        </h3>
        {table.players && table.players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {table.players.map((player, index) => (
              <div key={player.id || index} className="bg-background/30 p-3 rounded-lg flex items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold mr-3">
                   {(player.username || 'U')[0].toUpperCase()}
                 </div>
                 <span className="text-white">{player.username || 'Jogador'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm bg-background/30 p-4 rounded-lg text-center mb-6">
            Nenhum jogador confirmado ainda.
          </p>
        )}

        {isOwner && renderManagementSection()}
        
        {!isOwner && (
          <div className="mt-6">
            {renderJoinButton()}
            {renderJoinForm()}
          </div>
        )}
      </div>
    </div>
  );
}

export default TableDetailsModal;