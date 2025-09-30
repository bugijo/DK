import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import { requestPasswordReset } from '../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      
      setIsSubmitted(true);
      addToast({
        type: 'success',
        title: 'Sucesso!',
        message: 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro!',
        message: 'Erro ao enviar email de recuperação. Verifique se o email está correto e tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-secondary/30">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-title text-2xl text-text mb-2">Email Enviado!</h1>
              <p className="text-text-muted text-sm mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                Voltar ao Login
              </Link>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full bg-transparent border border-secondary/50 hover:border-primary text-text hover:text-primary font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Enviar Novamente
              </button>
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
          <h2 className="font-title text-2xl text-text mb-2">Recuperar Senha</h2>
          <p className="text-text-muted text-sm">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-text text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Digite seu email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/50 disabled:cursor-not-allowed text-background font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperação'
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
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}