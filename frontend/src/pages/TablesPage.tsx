import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TableCard } from '../components/TableCard';
import { CreateTableModal } from '../components/CreateTableModal';
import { TableDetailsModal } from '../components/TableDetailsModal';
import VirtualScrollList, { useVirtualScrolling, VirtualScrollIndicator } from '../components/VirtualScrollList';
import { type TableData } from '../services/api';
import { apiClient } from '../services/api';

const MOCK_CURRENT_USER_ID = '1'; // Simulando o ID do usuário logado

export function TablesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exploreTablesProgress, setExploreTablesProgress] = useState(0);

  const fetchTables = useCallback(async () => {
    console.log('[PAGE] 🔄 Iniciando busca de mesas...');
    // Não precisa de setLoading(true) aqui para re-fetches
    try {
      const response = await apiClient.get('/tables');
      const data = response.data;
      console.log('[PAGE] 📊 Dados recebidos da API:', data);
      
      // Mapear os dados da API para o formato esperado pelo frontend
      const mappedTables = data.map((table: any) => ({
        ...table,
        currentPlayers: Math.floor(Math.random() * table.maxPlayers), // Temporário
        status: 'Recrutando' as const, // Temporário
        schedule: 'A definir', // Temporário
        experience: 'Iniciante' // Temporário
      }));
      
      setTables(mappedTables);
      console.log('%c[PAGE] Estado das mesas foi ATUALIZADO no frontend.', 'color: lightblue;');
    } catch (error) {
      console.error('%c[PAGE] ERRO ao buscar as mesas.', 'color: red; font-weight: bold;', error);
      // Fallback para dados mock em caso de erro
      const mockTables: TableData[] = [
        {
          id: '1',
          title: 'A Mina Perdida de Phandelver',
          master_id: '1',
          description: 'Uma aventura clássica para iniciantes no mundo de D&D 5e.',
          max_players: 5,
          is_active: true,
          campaign_description: 'Uma aventura épica nas minas perdidas.',
          // Campos legados para compatibilidade
          maxPlayers: 5,
          currentPlayers: 3,
          system: 'D&D 5e',
          date: '2024-01-15',
          time: '19:00',
          type: 'online',
          isPrivate: false,
          players: [
            { id: '1', username: 'Alice', email: 'alice@example.com' },
            { id: '2', username: 'Bob', email: 'bob@example.com' },
            { id: '3', username: 'Charlie', email: 'charlie@example.com' }
          ],
          join_requests: []
        }
      ];
      setTables(mockTables);
    } finally {
      setLoading(false); // Apenas na primeira carga
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTables();
  }, [fetchTables]);

  const { myTables, exploreTables } = useMemo(() => {
    const allMyTables = tables.filter(t => t.master_id === MOCK_CURRENT_USER_ID);
    const allExploreTables = tables.filter(t => t.master_id !== MOCK_CURRENT_USER_ID);
    
    // Aplicar filtro de busca se houver termo de pesquisa
    if (searchTerm.trim()) {
      const filterBySearch = (table: TableData) => 
        table.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return {
        myTables: allMyTables.filter(filterBySearch),
        exploreTables: allExploreTables.filter(filterBySearch)
      };
    }
    
    return { myTables: allMyTables, exploreTables: allExploreTables };
  }, [tables, searchTerm]);



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-text-muted">Carregando mesas...</div>
      </div>
    );
  }

  return (
    <>
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTableCreated={fetchTables}
      />
      <TableDetailsModal
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        table={selectedTable}
        isOwner={selectedTable?.master_id === MOCK_CURRENT_USER_ID}
        onAction={() => {
          setSelectedTable(null);
          fetchTables();
        }}
      />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-title text-5xl font-bold text-primary">MESAS DE RPG</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar mesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:border-secondary"
          />
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-2 bg-secondary text-background font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
          >
            + Criar Mesa
          </button>
        </div>
      </div>

      {/* Seção Minhas Mesas */}
      <section className="mb-12">
        <h3 className="font-title text-3xl text-primary/90 border-b-2 border-secondary/30 pb-2 mb-4">Minhas Mesas</h3>
        {myTables.length > 0 ? (
          <VirtualScrollList
            items={myTables}
            itemHeight={200}
            containerHeight={400}
            renderItem={(table, index) => (
              <div key={table.id} className="p-4">
                <TableCard
                  table={table}
                  isOwner={true}
                  onClick={() => setSelectedTable(table)}
                />
              </div>
            )}
            className="border border-secondary/30 rounded-lg"
          />
        ) : (
          <p className="text-text-muted">Você ainda não criou nenhuma mesa.</p>
        )}
      </section>

      {/* Seção Explorar Mesas */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-title text-3xl text-primary/90 border-b-2 border-secondary/30 pb-2">Explorar Mesas</h3>
          {exploreTables.length > 10 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Scroll:</span>
              <VirtualScrollIndicator progress={exploreTablesProgress} className="w-20" />
            </div>
          )}
        </div>
        
        {exploreTables.length > 0 ? (
          <VirtualScrollList
            items={exploreTables}
            itemHeight={200}
            containerHeight={600}
            renderItem={(table, index) => (
              <div key={table.id} className="p-4">
                <TableCard
                  table={table}
                  isOwner={false}
                  onClick={() => setSelectedTable(table)}
                />
              </div>
            )}
            className="border border-secondary/30 rounded-lg"
            onScroll={(scrollTop) => {
              const progress = scrollTop / ((exploreTables.length * 200) - 600);
              setExploreTablesProgress(Math.max(0, Math.min(1, progress)));
            }}
          />
        ) : (
          <p className="text-text-muted">Nenhuma outra mesa disponível no momento.</p>
        )}
      </section>
    </>
  );
}