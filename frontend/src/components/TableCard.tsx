import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { TableData } from '../services/api';

interface TableCardProps {
  table: TableData;
  isOwner: boolean;
  onClick: () => void; // NOVA PROP
}

export function TableCard({ table, isOwner, onClick }: TableCardProps) {
  const { user } = useAuthContext();
  
  // Verifica se o usuário logado está na lista de jogadores aprovados
  const isPlayer = table.players?.some(player => player.id === user?.id || player.username === user?.username) || false;
  return (
    // Aplicando o onClick na div principal e adicionando cursor-pointer
    <div onClick={onClick} className="bg-surface/70 backdrop-blur-sm rounded-lg border border-secondary/30 flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:border-primary/60 shadow-lg cursor-pointer">
      <img
        src={table.imageUrl || '/placeholder-image.png'} // Usa a imagem da mesa ou um placeholder
        alt={`Arte da mesa ${table.title}`}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-title text-xl text-primary truncate" title={table.title}>{table.title}</h3>
        <p className="text-sm text-text-muted mb-2">Mestre ID: {table.master_id}</p>
        <p className="font-body text-sm text-text-base flex-grow line-clamp-3 mb-4">{table.description}</p>
        <div className="flex justify-between items-center text-xs text-text-muted border-t border-gray-700 pt-2">
          <span>{table.system}</span>
          <span>{table.currentPlayers || 0}/{table.maxPlayers} Jogadores</span>
        </div>
      </div>
      <div className="p-2 bg-background/50 flex gap-2">
        <button className="bg-primary/80 hover:bg-primary text-background font-bold text-sm py-2 rounded flex-1">Detalhes</button>
        
        {(isOwner || isPlayer) && (
          <Link to={`/session/${table.id}`} onClick={(e) => e.stopPropagation()}>
            <button className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm py-2 px-4 rounded transition-colors">
              Entrar
            </button>
          </Link>
        )}
        
        {isOwner && (
          <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold text-sm py-2 px-4 rounded flex items-center justify-center">
            <img src="/icons/Configuração.png" alt="Configurações" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TableCard;