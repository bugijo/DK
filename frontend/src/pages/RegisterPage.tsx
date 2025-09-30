import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, UserCreateData } from '../services/api';

export function RegisterPage() {
  const [formData, setFormData] = useState<UserCreateData>({
    username: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Validações básicas
    if (formData.password !== confirmPassword) {
      // Usar toast para validações locais também
      toast.error('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      // O interceptor já cuida da notificação de erro
      console.error('Erro no registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-secondary/30">
        <div className="text-center mb-8">
          <h1 className="font-title text-4xl text-primary mb-2">DK</h1>
          <h2 className="font-title text-2xl text-text mb-2">Criar Conta</h2>
          <p className="text-text-muted text-sm">Junte-se à comunidade de RPG</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-text text-sm font-medium mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Digite seu nome de usuário"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-text text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Digite seu email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-text text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Digite sua senha (mín. 6 caracteres)"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-text text-sm font-medium mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Confirme sua senha"
            />
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-secondary/50 disabled:cursor-not-allowed text-background font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando conta...
              </>
            ) : success ? (
              'Conta criada!'
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-text-muted text-sm">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Faça o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}