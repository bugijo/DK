import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { getUserItems, ItemData } from '../services/api';

// Componentes de ícones SVG simples
const ShoppingBagIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CoinsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

type StoreItem = ItemData;

export function StorePage() {
  const { user } = useAuthContext();
  const { showSuccess, showError } = useToastContext();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Buscar itens da loja
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getUserItems();
        setItems(data);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
        showError('Erro', 'Erro ao carregar itens da loja');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [showError]);

  // Filtrar itens
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.type.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRarity = selectedRarity === 'all' || item.rarity.toLowerCase() === selectedRarity.toLowerCase();
    return matchesSearch && matchesCategory && matchesRarity;
  });

  // Função para obter cor da raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  // Função para comprar item
  const handleBuyItem = (item: StoreItem) => {
    showSuccess('Compra realizada!', `Você comprou ${item.name} por ${item.price} moedas!`);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-primary text-xl">Carregando loja...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Medieval */}
        <div className="text-center mb-8">
          <div className="relative">
            <h1 className="font-title text-6xl font-bold text-primary mb-2">
              🏪 O Mercado Medieval
            </h1>
            <p className="text-text-muted text-lg">
              Equipamentos épicos para aventureiros corajosos
            </p>
            <div className="absolute -top-4 -right-4 text-6xl opacity-20"><img src="/icons/Equipamentos.png" alt="Equipamentos" style={{width: '60px', height: '60px'}} /></div>
            <div className="absolute -top-4 -left-4 text-6xl opacity-20"><img src="/icons/Escudo.png" alt="Escudo" style={{width: '60px', height: '60px'}} /></div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-surface/70 backdrop-blur-sm p-6 rounded-lg border border-secondary/30 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>

            {/* Categoria */}
            <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
              <option value="all">Todas Categorias</option>
              <option value="weapon">Armas</option>
              <option value="armor">Armaduras</option>
              <option value="shield">Escudos</option>
              <option value="accessory">Acessórios</option>
              <option value="potion">Poções</option>
              <option value="scroll">Pergaminhos</option>
              <option value="tool">Ferramentas</option>
            </select>

            {/* Raridade */}
            <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
              <option value="all">Todas Raridades</option>
              <option value="common">Comum</option>
              <option value="uncommon">Incomum</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Lendário</option>
            </select>

            {/* Estatísticas */}
            <div className="flex items-center justify-center bg-primary/20 rounded-lg px-4 py-2">
              <CoinsIcon />
              <span className="ml-2 text-primary font-bold">{filteredItems.length} itens</span>
            </div>
          </div>
        </div>

        {/* Grid de Itens */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <div className="text-text-muted text-xl mb-4">
              Nenhum item encontrado.
            </div>
            <p className="text-text-muted">
              Tente ajustar os filtros ou aguarde novos itens chegarem à loja.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg border border-gray-600/50 hover:border-yellow-400/70 cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl"
              >
                {/* Imagem do Item */}
                <div className="relative mb-4">
                  <div className="w-full h-32 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="text-6xl">
                      {item.image_url || '📦'}
                    </div>
                  </div>
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold border ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </div>
                </div>

                {/* Informações do Item */}
                <div className="space-y-2">
                  <h3 className="font-title text-lg text-white font-bold truncate">
                    {item.name}
                  </h3>
                  <p className="text-gray-200 text-sm line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white bg-gray-700/80 px-2 py-1 rounded">
                      {item.type}
                    </span>
                    <div className="flex items-center text-yellow-400 font-bold">
                      <CoinsIcon />
                      <span className="ml-1">{item.price}</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Compra */}
                <button className="w-full mt-4 bg-primary hover:bg-primary/90 text-background font-bold py-2 rounded-lg transition-colors flex items-center justify-center">
                  <ShoppingBagIcon />
                  <span className="ml-2">Comprar</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalhes do Item */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-secondary/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="p-6 border-b border-secondary/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-title text-2xl text-primary font-bold mb-2">
                      {selectedItem.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded text-sm font-bold border ${getRarityColor(selectedItem.rarity)}`}>
                        {selectedItem.rarity}
                      </span>
                      <span className="text-text-muted bg-background/50 px-3 py-1 rounded text-sm">
                        {selectedItem.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-text-muted hover:text-text transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagem */}
                  <div className="space-y-4">
                     <div className="w-full h-48 bg-background/50 rounded-lg flex items-center justify-center">
                       <div className="text-8xl">
                         {selectedItem.image_url || '📦'}
                       </div>
                     </div>
                   </div>

                  {/* Detalhes */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-primary mb-2">Descrição</h3>
                      <p className="text-text-muted leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-primary mb-2">Preço</h3>
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <CoinsIcon />
                        <span className="ml-2">{selectedItem.price} moedas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleBuyItem(selectedItem)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-background font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ShoppingBagIcon />
                    <span className="ml-2">Comprar por {selectedItem.price} moedas</span>
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 bg-surface/50 hover:bg-surface text-text border border-secondary/30 rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}