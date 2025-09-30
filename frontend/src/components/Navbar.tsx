import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUserCharacters } from '../services/api';
// import heartIcon from '../assets/icons/heart.svg'; // Removido para usar caminho absoluto

interface UserStats {
  level: number;
  gold: number;
  gems: number;
  shards: number;
  characterCount: number;
}

export function Navbar() {
  const { user, token, logout } = useAuthContext();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    gold: 100,
    gems: 5,
    shards: 10,
    characterCount: 0
  });
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Buscar dados dinâmicos do usuário
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!token || !user) return;
      
      try {
        // Buscar personagens do usuário para calcular nível
        const characters = await getUserCharacters();
        
        // Calcular estatísticas baseadas nos personagens
        const characterCount = characters.length;
        const totalLevels = characters.reduce((sum, char) => sum + (char.level || 1), 0);
        const averageLevel = characterCount > 0 ? Math.ceil(totalLevels / characterCount) : 1;
        
        // Calcular recursos baseados no nível e atividade
        const calculatedLevel = Math.max(1, averageLevel);
        const baseGold = 100;
        const goldPerLevel = 50;
        const calculatedGold = baseGold + (calculatedLevel * goldPerLevel);
        
        const baseGems = 5;
        const gemsPerLevel = 2;
        const calculatedGems = baseGems + Math.floor(calculatedLevel / 3) * gemsPerLevel;
        
        const baseShards = 10;
        const shardsPerCharacter = 15;
        const calculatedShards = baseShards + (characterCount * shardsPerCharacter);
        
        setUserStats({
          level: calculatedLevel,
          gold: calculatedGold,
          gems: calculatedGems,
          shards: calculatedShards,
          characterCount
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
        // Manter valores padrão em caso de erro
      }
    };
    
    fetchUserStats();
  }, [token, user]);

  return (
    <nav className="bg-black/50 backdrop-blur-sm border-b-2 border-secondary/50 shadow-lg p-4 flex justify-between items-center text-text-base">
      {/* Lado Esquerdo */}
      <div className="flex items-center space-x-4">
        <img src="/logo.svg" alt="Logo" className="h-14" /> {/* Logo como imagem */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-title font-bold text-primary">Dungeon Keeper</h1>
        </Link>
      </div>
      
      {/* Lado Direito */}
      <div className="flex items-center space-x-6">
        {token && user ? (
          <>
            <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              {user.avatar_url ? (
                <img 
                  src={`http://localhost:8000${user.avatar_url}?t=${new Date().getTime()}`} 
                  alt="Avatar" 
                  className="h-14 w-14 rounded-full border-2 border-primary/50 object-cover" 
                />
              ) : (
                <div className="h-14 w-14 rounded-full border-2 border-primary/50 bg-surface/50 flex items-center justify-center">
                  <svg className="h-8 w-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="text-left">
                <span className="text-xl font-title font-bold text-text-base">{user.username}</span>
                <span className="block text-sm text-primary">Level {userStats.level}</span>
                <span className="block text-xs text-text-muted">{userStats.characterCount} personagens</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4 bg-surface/50 px-4 py-2 rounded-lg border border-gray-700">
              <div className="flex items-center" title="Ouro"><img src="/icons/Ouro.png" alt="Ouro" className="h-5 w-5 mr-2" /><span>{userStats.gold.toLocaleString()}</span></div>
              <div className="flex items-center" title="Gemas"><img src="/icons/Gema.png" alt="Gemas" className="h-5 w-5 mr-2" /><span>{userStats.gems}</span></div>
              <div className="flex items-center" title="Fragmentos"><img src="/icons/Coração.png" alt="Fragmentos" className="h-5 w-5 mr-2" /><span>{userStats.shards}</span></div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/settings" className="p-2 rounded-full bg-surface/60 hover:bg-surface" title="Configurações">
                <img src="/icons/Configuração.png" alt="Configurações" className="h-6 w-6" />
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-full bg-surface/60 hover:bg-surface" title="Sair"><img src="/icons/Sair.png" alt="Sair" className="h-6 w-6" /></button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login" className="px-4 py-2 bg-primary hover:bg-primary/90 text-background font-medium rounded-lg transition-colors">
              Entrar
            </Link>
            <Link to="/register" className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-text font-medium rounded-lg transition-colors">
              Registrar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}