import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import { resetPassword } from '../services/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setHasError(true);
      addToast({
        type: 'error',
        title: 'Token Inválido',
        message: 'Link de recuperação inválido ou expirado.'
      });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Token de recuperação não encontrado.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Senhas não coincidem',
        message: 'As senhas digitadas não são idênticas. Verifique e tente novamente.'
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Senha muito curta',
        message: 'A senha deve ter pelo menos 6 caracteres.'
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      
      addToast({
        type: 'success',
        title: 'Sucesso!',
        message: 'Senha redefinida com sucesso! Você já pode fazer o login.'
      });
      
      // Redirecionar para a página de login após sucesso
      navigate('/login');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro!',
        message: 'Erro ao redefinir senha. O link pode ter expirado. Tente solicitar um novo link.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-secondary/30">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-title text-2xl text-text mb-2">Link Inválido</h1>
              <p className="text-text-muted text-sm mb-6">
                O link de recuperação é inválido ou expirou.
                Solicite um novo link de recuperação.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                Solicitar Novo Link
              </Link>
              
              <Link
                to="/login"
                className="w-full bg-transparent border border-secondary/50 hover:border-primary text-text hover:text-primary font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-secondary/30">
        <div className="text-center mb-8">
          <h1 className="font-title text-4xl text-primary mb-2">DK</h1>
          <h2 className="font-title text-2xl text-text mb-2">Nova Senha</h2>
          <p className="text-text-muted text-sm">
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-text text-sm font-medium mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 pr-12 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {showNewPassword ? <img src="/icons/Oculto.png" alt="Ocultar" style={{width: '20px', height: '20px'}} /> : <img src="/icons/Visível.png" alt="Mostrar" style={{width: '20px', height: '20px'}} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-text text-sm font-medium mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 pr-12 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {showConfirmPassword ? <img src="/icons/Oculto.png" alt="Ocultar" style={{width: '20px', height: '20px'}} /> : <img src="/icons/Visível.png" alt="Mostrar" style={{width: '20px', height: '20px'}} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/50 disabled:cursor-not-allowed text-background font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redefinindo...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-medium transition-colors text-sm"
          >
            ← Voltar ao Login
          </Link>
          
          <p className="text-text-muted text-sm">
            Lembrou da senha?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}