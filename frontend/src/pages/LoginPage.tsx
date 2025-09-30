import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Usa a função login do AuthContext
      const success = await login(username, password);
      if (success) {
        navigate('/'); // Redireciona para o Dashboard
      }
    } catch (err: any) {
      console.error("Erro detalhado do login:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-secondary/30">
        <div className="text-center mb-8">
          <h1 className="font-title text-4xl text-primary mb-2">DK</h1>
          <h2 className="font-title text-2xl text-text mb-2">Entrar</h2>
          <p className="text-text-muted text-sm">Acesse sua conta de RPG</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-text text-sm font-medium mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Digite seu nome de usuário"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline">
              <label htmlFor="password" className="block text-text text-sm font-medium mb-2">
                Senha
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary/80 hover:text-primary hover:underline transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-background border border-secondary/50 text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-text-muted hover:text-primary transition-colors"
              >
                {showPassword ? <img src="/icons/Olho-Aberto.png" alt="Mostrar" style={{width: '20px', height: '20px'}} /> : <img src="/icons/Olho-Fechado.png" alt="Ocultar" style={{width: '20px', height: '20px'}} />}
              </button>
            </div>
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
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
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