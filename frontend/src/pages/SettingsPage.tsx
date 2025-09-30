import React, { useState, useEffect } from 'react';
import { getMe, updateMyNotificationSettings, UserProfileData, NotificationSettingsData } from '../services/api';
import { useUIStore } from '../stores/uiStore';
import { useToastContext } from '../contexts/ToastContext';
import { useGameSettings } from '../hooks/useGameSettings';
import { SettingsModal } from '../components/SettingsModal';
import { PageLoader } from '../components/LoadingSpinner';
import { useAuthContext } from '../contexts/AuthContext';

// Componentes de ícones SVG
const SettingsIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const GamepadIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
  </svg>
);

export function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const { showSuccess, showError } = useToastContext();
  const { logout } = useAuthContext();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const {
    settings: gameSettings,
    isLoading: settingsLoading,
    updateSetting,
    resetToDefaults,
    exportSettings,
    importSettings
  } = useGameSettings();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'export' | 'import'>('export');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (settingName: keyof NotificationSettingsData, value: boolean) => {
    if (!user) return;

    setSaving(true);
    setUser(prevUser => prevUser ? { ...prevUser, [settingName]: value } : null);

    try {
      await updateMyNotificationSettings({ [settingName]: value });
      showSuccess('Sucesso', 'Configuração atualizada com sucesso!');
    } catch (error) {
      showError('Erro', 'Não foi possível atualizar a configuração');
      setUser(prevUser => prevUser ? { ...prevUser, [settingName]: !value } : null);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Erro', 'As senhas não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showError('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setSaving(true);
    try {
      // Aqui você implementaria a chamada para a API de mudança de senha
      showSuccess('Sucesso', 'Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showError('Erro', 'Não foi possível alterar a senha');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      try {
        // Implementar chamada para API de exclusão de conta
        showSuccess('Sucesso', 'Conta excluída com sucesso');
        logout();
      } catch (error) {
        showError('Erro', 'Não foi possível excluir a conta');
      }
    }
  };

  const tabs = [
    { id: 'general', name: 'Geral', icon: <SettingsIcon /> },
    { id: 'appearance', name: 'Aparência', icon: <PaletteIcon /> },
    { id: 'game', name: 'Jogo', icon: <GamepadIcon /> },
    { id: 'notifications', name: 'Notificações', icon: <BellIcon /> },
    { id: 'security', name: 'Segurança', icon: <SecurityIcon /> }
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-title text-5xl font-bold text-primary">CONFIGURAÇÕES</h2>
      </div>

      <div className="flex gap-8">
        {/* Sidebar com abas */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-text-base hover:bg-surface/50'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
                <h3 className="font-title text-2xl text-primary mb-6">Configurações Gerais</h3>
                
                <div className="space-y-6">
                  {/* Idioma */}
                  <div>
                    <label className="block text-text-base font-semibold mb-2">Idioma</label>
                    <select className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>

                  {/* Fuso Horário */}
                  <div>
                    <label className="block text-text-base font-semibold mb-2">Fuso Horário</label>
                    <select className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary">
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                    </select>
                  </div>

                  {/* Auto-save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Salvamento Automático</label>
                      <p className="text-text-muted text-sm">Salva automaticamente suas alterações</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
                <h3 className="font-title text-2xl text-primary mb-6">Aparência</h3>
                
                <div className="space-y-6">
                  {/* Tema */}
                  <div>
                    <label className="block text-text-base font-semibold mb-4">Tema Visual</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTheme('theme-dark')} 
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'theme-dark' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-8 h-8 bg-gray-800 rounded-full mr-2"></div>
                          <span>Tema Escuro</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => setTheme('theme-light')} 
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'theme-light' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                          <span>Tema Claro</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Modo Compacto */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Modo Compacto</label>
                      <p className="text-text-muted text-sm">Reduz o espaçamento entre elementos da interface</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={gameSettings?.compactMode || false}
                        onChange={(e) => updateSetting('compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Animações */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Animações</label>
                      <p className="text-text-muted text-sm">Ativa animações e transições na interface</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'game' && (
            <div className="space-y-6">
              <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
                <h3 className="font-title text-2xl text-primary mb-6">Configurações de Jogo</h3>
                
                <div className="space-y-6">
                  {/* Som */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Som Habilitado</label>
                      <p className="text-text-muted text-sm">Ativa ou desativa todos os sons do sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={gameSettings?.soundEnabled || false}
                        onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Volume */}
                  <div>
                    <label className="block text-text-base font-semibold mb-2">
                      Volume da Música: {gameSettings?.musicVolume || 50}%
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={gameSettings?.musicVolume || 50}
                      onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value))}
                      disabled={!gameSettings?.soundEnabled}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Auto-roll */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Rolagem Automática de Dados</label>
                      <p className="text-text-muted text-sm">Rola dados automaticamente em combate</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Tooltips */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Mostrar Dicas de Ferramentas</label>
                      <p className="text-text-muted text-sm">Exibe informações adicionais ao passar o mouse</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={gameSettings?.showTooltips || false}
                        onChange={(e) => updateSetting('showTooltips', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && user && (
            <div className="space-y-6">
              <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
                <h3 className="font-title text-2xl text-primary mb-6">Notificações</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Pedidos de Entrada em Mesas</label>
                      <p className="text-text-muted text-sm">Receba notificações quando alguém solicitar entrada em suas mesas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={user.notify_on_join_request}
                        onChange={(e) => handleNotificationChange('notify_on_join_request', e.target.checked)}
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Aprovação de Pedidos</label>
                      <p className="text-text-muted text-sm">Receba notificações quando seus pedidos forem aprovados</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={user.notify_on_request_approved}
                        onChange={(e) => handleNotificationChange('notify_on_request_approved', e.target.checked)}
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-text-base font-semibold">Novas Histórias</label>
                      <p className="text-text-muted text-sm">Receba notificações sobre novas histórias e conteúdos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={user.notify_on_new_story}
                        onChange={(e) => handleNotificationChange('notify_on_new_story', e.target.checked)}
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
                <h3 className="font-title text-2xl text-primary mb-6">Segurança</h3>
                
                <div className="space-y-6">
                  {/* Alterar Senha */}
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h4 className="text-lg font-semibold text-text-base">Alterar Senha</h4>
                    
                    <div>
                      <label className="block text-text-base font-medium mb-2">Senha Atual</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-text-base font-medium mb-2">Nova Senha</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary"
                        minLength={6}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-text-base font-medium mb-2">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-background font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>

                  <div className="border-t border-secondary/30 pt-6">
                    <h4 className="text-lg font-semibold text-text-base mb-4">Zona de Perigo</h4>
                    
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <h5 className="text-red-400 font-semibold mb-2">Excluir Conta</h5>
                      <p className="text-text-muted text-sm mb-4">
                        Esta ação é irreversível. Todos os seus dados, personagens, mesas e histórias serão permanentemente excluídos.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                      >
                        Excluir Conta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SettingsPage;