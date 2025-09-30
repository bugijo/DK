import React, { useState, useEffect } from 'react';
import { getMe, updateUserMe, uploadAvatar, updateMyNotificationSettings, importUserData, UserProfileData, NotificationSettingsData } from '../services/api';
import { useUIStore } from '../stores/uiStore';
import { useAuthContext } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';

// Componentes de ícones SVG
const UserIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export function ProfilePage() {
  const { theme, setTheme } = useUIStore();
  const { showSuccess, showError } = useToastContext();
  const { token, refreshUser } = useAuthContext();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getMe();
      setUser(data);
      setBio(data.bio || '');
      setPreview(data.avatar_url ? `http://localhost:8000${data.avatar_url}` : null);
    } catch (error) {
      showError('Erro', 'Não foi possível carregar os dados do usuário');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const response = await uploadAvatar(selectedFile);
      setPreview(`http://localhost:8000${response.avatar_url}?t=${new Date().getTime()}`);
      showSuccess('Sucesso', 'Avatar atualizado com sucesso!');
      setSelectedFile(null);
      
      // Recarregar dados do usuário no contexto para atualizar o navbar
      await refreshUser();
    } catch (error) {
      showError('Erro', 'Não foi possível fazer upload do avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserMe({ bio });
      showSuccess('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      showError('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (settingName: keyof NotificationSettingsData, value: boolean) => {
    setLoading(true);
    try {
      await updateMyNotificationSettings({ [settingName]: value });
      setUser(prevUser => prevUser ? { ...prevUser, [settingName]: value } : null);
      showSuccess('Sucesso', 'Configuração atualizada com sucesso!');
    } catch (error) {
      showError('Erro', 'Não foi possível atualizar a notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImportStatus('importing');
    try {
      await importUserData(importFile);
      setImportStatus('success');
      showSuccess('Sucesso', 'Dados importados com sucesso!');
    } catch (error) {
      setImportStatus('error');
      showError('Erro', 'Não foi possível importar os dados');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-text-muted">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="bg-surface/70 hover:bg-surface border border-secondary/30 hover:border-primary/50 text-text hover:text-primary p-3 rounded-lg transition-all flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
          <h2 className="font-title text-5xl font-bold text-primary">MEU PERFIL</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da esquerda - Avatar e informações básicas */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
            <h3 className="font-title text-2xl text-primary mb-6 flex items-center">
              <UserIcon />
              <span className="ml-2">Avatar</span>
            </h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/50 shadow-lg" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-surface/50 flex items-center justify-center border-4 border-secondary/30">
                    <UserIcon />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg">
                  <CameraIcon />
                </div>
              </div>
              
              <div className="w-full space-y-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-background hover:file:bg-primary/90 file:cursor-pointer"
                />
                {selectedFile && (
                  <button 
                    onClick={handleAvatarUpload}
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary/80 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Atualizar Avatar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas do usuário */}
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
            <h3 className="font-title text-xl text-primary mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Membro desde:</span>
                <span className="text-text-base font-medium">Janeiro 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Personagens criados:</span>
                <span className="text-text-base font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Mesas participadas:</span>
                <span className="text-text-base font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sessões jogadas:</span>
                <span className="text-text-base font-medium">48</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da direita - Informações detalhadas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações pessoais */}
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
            <h3 className="font-title text-2xl text-primary mb-6">Informações Pessoais</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-text-base font-semibold mb-2">Nome de Usuário</label>
                  <input 
                    type="text" 
                    value={user.username} 
                    disabled 
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-surface/30 text-text-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted mt-1">O nome de usuário não pode ser alterado</p>
                </div>
                
                <div>
                  <label className="block text-text-base font-semibold mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-surface/30 text-text-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted mt-1">Entre em contato para alterar o email</p>
                </div>
              </div>
              
              <div>
                <label className="block text-text-base font-semibold mb-2">Biografia</label>
                <textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  rows={4} 
                  placeholder="Conte um pouco sobre você, sua experiência com RPG, personagens favoritos..."
                  className="w-full px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-text-muted mt-1">{bio.length}/500 caracteres</p>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-background font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </form>
          </div>

          {/* Seção do Tema */}
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
            <h3 className="font-title text-2xl text-primary mb-6">Tema Visual</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('theme-dark')} 
                className={`p-4 rounded-lg border-2 transition-colors ${
                  theme === 'theme-dark' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-secondary/30 hover:border-secondary/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    <img src="/icons/Lua-Noite.png" alt="Lua" className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="font-semibold">Tema Escuro</div>
                </div>
              </button>
              <button 
                onClick={() => setTheme('theme-light')} 
                className={`p-4 rounded-lg border-2 transition-colors ${
                  theme === 'theme-light' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-secondary/30 hover:border-secondary/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    <img src="/icons/Sol-Dia.png" alt="Sol" className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="font-semibold">Tema Claro</div>
                </div>
              </button>
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
            <h3 className="font-title text-2xl text-primary mb-6">Notificações</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                <div>
                  <label htmlFor="notify_on_join_request" className="text-text-base font-medium cursor-pointer">
                    Pedidos de entrada em mesas
                  </label>
                  <p className="text-sm text-text-muted">Receber e-mail quando alguém solicitar entrada em suas mesas</p>
                </div>
                <input 
                  id="notify_on_join_request" 
                  type="checkbox" 
                  checked={user.notify_on_join_request} 
                  onChange={(e) => handleNotificationChange('notify_on_join_request', e.target.checked)} 
                  className="w-5 h-5 text-primary bg-background border-secondary/30 rounded focus:ring-primary focus:ring-2" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                <div>
                  <label htmlFor="notify_on_request_approved" className="text-text-base font-medium cursor-pointer">
                    Aprovação de pedidos
                  </label>
                  <p className="text-sm text-text-muted">Receber e-mail quando seus pedidos forem aprovados</p>
                </div>
                <input 
                  id="notify_on_request_approved" 
                  type="checkbox" 
                  checked={user.notify_on_request_approved} 
                  onChange={(e) => handleNotificationChange('notify_on_request_approved', e.target.checked)} 
                  className="w-5 h-5 text-primary bg-background border-secondary/30 rounded focus:ring-primary focus:ring-2" 
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                <div>
                  <label htmlFor="notify_on_new_story" className="text-text-base font-medium cursor-pointer">
                    Novidades da plataforma
                  </label>
                  <p className="text-sm text-text-muted">Receber e-mail sobre novas histórias e atualizações</p>
                </div>
                <input 
                  id="notify_on_new_story" 
                  type="checkbox" 
                  checked={user.notify_on_new_story} 
                  onChange={(e) => handleNotificationChange('notify_on_new_story', e.target.checked)} 
                  className="w-5 h-5 text-primary bg-background border-secondary/30 rounded focus:ring-primary focus:ring-2" 
                />
              </div>

            </div>
          </div>

          {/* Backup e dados */}
          <div className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 p-6">
            <h3 className="font-title text-2xl text-primary mb-6">Backup e Dados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exportar dados */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <DownloadIcon />
                  <h4 className="text-lg font-semibold text-text-base">Exportar Dados</h4>
                </div>
                <p className="text-text-muted text-sm">
                  Baixe todos os seus dados (personagens, itens, histórias) em um arquivo JSON.
                </p>
                <a 
                  href={`http://localhost:8000/api/v1/backup/export?token=${token}`} 
                  download={`dungeon_keeper_backup_${new Date().toISOString().split('T')[0]}.json`}
                >
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Exportar Meus Dados
                  </button>
                </a>
              </div>

              {/* Importar dados */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <UploadIcon />
                  <h4 className="text-lg font-semibold text-text-base">Importar Dados</h4>
                </div>
                <p className="text-text-muted text-sm">
                  Restaure seus dados a partir de um arquivo de backup.
                </p>
                <div className="space-y-3">
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileSelect} 
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary/80 file:cursor-pointer"
                  />
                  <button 
                    onClick={handleImport} 
                    disabled={!importFile || importStatus === 'importing'} 
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {importStatus === 'importing' ? 'Importando...' : 'Importar Dados'}
                  </button>
                  {importStatus === 'success' && (
                    <p className="text-green-400 text-sm"><img src="/icons/Sucesso.png" alt="Sucesso" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Importação concluída com sucesso!</p>
                  )}
                  {importStatus === 'error' && (
                    <p className="text-red-400 text-sm"><img src="/icons/Cancelar.png" alt="Erro" style={{width: '16px', height: '16px', display: 'inline', marginRight: '4px'}} />Falha na importação.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}