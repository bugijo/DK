import axios from 'axios';
import toast from 'react-hot-toast';
// Removido useAuthStore - usando interceptors do axios
import { API_ROUTES } from '../constants/apiRoutes';

// Backend FastAPI rodando na porta 8000
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Intercepta TODAS as requisições antes de serem enviadas
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR: Intercepta respostas 401 para logout automático
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar localStorage e redirecionar
      localStorage.removeItem('auth_token');
      // Redirecionar para login se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// INTERCEPTOR: Intercepta TODAS as respostas para tratamento automático de erros
apiClient.interceptors.response.use(
  (response) => {
    // Resposta de sucesso - apenas retorna a resposta
    return response;
  },
  (error) => {
    // Tratamento automático de erros com notificações toast
    let errorMessage = 'Erro inesperado. Tente novamente.';
    
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response;
      
      if (data?.detail) {
        // FastAPI retorna erros no campo 'detail'
        errorMessage = typeof data.detail === 'string' ? data.detail : 'Erro no servidor';
      } else if (data?.message) {
        // Alguns endpoints podem usar 'message'
        errorMessage = data.message;
      } else {
        // Mensagens padrão baseadas no status HTTP
        switch (status) {
          case 400:
            errorMessage = 'Dados inválidos. Verifique as informações enviadas.';
            break;
          case 401:
            errorMessage = 'Acesso negado. Faça login novamente.';
            break;
          case 403:
            errorMessage = 'Você não tem permissão para esta ação.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 422:
            errorMessage = 'Dados inválidos. Verifique os campos obrigatórios.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = `Erro ${status}: ${error.response.statusText || 'Erro desconhecido'}`;
        }
      }
    } else if (error.request) {
      // Erro de rede (sem resposta do servidor)
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    // Dispara a notificação toast de erro
    toast.error(errorMessage);
    
    // Rejeita a promessa para que o código local ainda possa reagir se necessário
    return Promise.reject(error);
  }
);

// Tipagem base para usuário
export type UserBase = {
  id: string;
  username: string;
  email: string;
};

// Tipagens para perfil do usuário
export type UserProfileData = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  notify_on_join_request: boolean;
  notify_on_request_approved: boolean;
  notify_on_new_story: boolean;
  // ... outras informações de perfil que possam vir no futuro
};

export type UserUpdateData = {
  email?: string;
  bio?: string;
};

// Tipagem para configurações de notificação
export type NotificationSettingsData = {
  notify_on_join_request?: boolean;
  notify_on_request_approved?: boolean;
  notify_on_new_story?: boolean;
};

// Tipagem para solicitação de entrada (removida - usando a versão correta mais abaixo)

// Adicione a tipagem para uma solicitação de entrada (mantida para compatibilidade)
export type JoinRequest = {
  id: string;
  userId: string;
  userName: string;
  user?: UserBase;
  // Futuramente: characterLevel, characterClass, etc.
};

// Tipagem para criação de usuário
export type UserCreateData = {
  username: string;
  email: string;
  password: string;
};

// Crie uma tipagem para os dados de login
export type LoginData = {
  username: string;
  password: string;
};

// Tipagem para estado dos tokens no mapa tático
export type TokenState = {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  size: number;
  label: string;
};

// Tipagem para os dados da mesa (pode ser movida para um arquivo de tipos no futuro)
export type TableData = {
  id: string;
  title: string;
  master_id: string;
  description: string;
  
  // Configurações da mesa
  max_players: number;
  min_character_level?: number;
  max_character_level?: number;
  scheduled_date?: string;
  location?: string;
  campaign_description?: string;
  is_active: boolean;
  
  // Campos legados (manter compatibilidade)
  maxPlayers?: number;
  currentPlayers?: number;
  system?: string;
  date?: string;
  time?: string;
  type?: 'online' | 'presencial';
  address?: string;
  isPrivate?: boolean;
  
  // Relacionamentos
  master?: UserBase;
  players?: UserBase[];
  join_requests?: JoinRequestResponse[];
  
  // Campos de mapa
  imageUrl?: string;
  map_image_url?: string | null;
  tokens_state?: TokenState[] | null;
};

export type JoinRequestResponse = {
  id: string;
  table_id: string;
  user_id: string;
  character_id: string;
  status: 'pending' | 'approved' | 'declined';
  message?: string;
  master_response?: string;
  created_at: string;
  updated_at: string;
  user: UserBase;
  character: CharacterData;
};

export const getTables = async (): Promise<TableData[]> => {
  const response = await apiClient.get(API_ROUTES.TABLES.BASE);
  return response.data;
};

export const createTable = async (tableData: Omit<TableData, 'id'>): Promise<TableData> => {
  const response = await apiClient.post(API_ROUTES.TABLES.BASE, tableData);
  return response.data;
};

export const getTableById = async (tableId: string): Promise<TableData> => {
  const response = await apiClient.get(API_ROUTES.TABLES.BY_ID(tableId));
  return response.data;
};

export type JoinRequestData = {
  table_id: string;
  character_id: string;
  message?: string;
};

export const requestToJoinTable = async (requestData: JoinRequestData): Promise<void> => {
  await apiClient.post(API_ROUTES.TABLES.JOIN_REQUEST(requestData.table_id), {
    table_id: requestData.table_id,
    character_id: requestData.character_id,
    message: requestData.message
  });
};

// Função para registrar novo usuário
export const registerUser = async (userData: UserCreateData): Promise<UserBase> => {
  const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, userData);
  return response.data;
};

// Substitua a função loginUser
export const loginUser = async (credentials: LoginData): Promise<{ access_token: string }> => {
  // O backend espera FormData para OAuth2PasswordRequestForm
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  
  const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const approveJoinRequest = async (requestId: string): Promise<void> => {
  await apiClient.post(`/tables/requests/${requestId}/approve`);
};

export const declineJoinRequest = async (requestId: string): Promise<void> => {
  await apiClient.post(`/tables/requests/${requestId}/decline`);
};

// Função para upload de mapa
export const uploadMap = async (tableId: string, file: File): Promise<{ message: string; map_url: string; table_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(`/tables/${tableId}/upload-map`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Tipagens para personagens
export type CharacterAttributes = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type CharacterData = {
  id: string;
  owner_id: string;
  name: string;
  race: string;
  character_class: string;
  level: number;
  attributes: CharacterAttributes;
};

export type CharacterCreateData = Omit<CharacterData, 'id' | 'owner_id'>;

// Funções para personagens
export const getUserCharacters = async (): Promise<CharacterData[]> => {
  const response = await apiClient.get(API_ROUTES.CHARACTERS.BASE);
  return response.data;
};

export const createCharacter = async (characterData: CharacterCreateData): Promise<CharacterData> => {
  const response = await apiClient.post(API_ROUTES.CHARACTERS.BASE, characterData);
  return response.data;
};

export const getCharacterById = async (characterId: string): Promise<CharacterData> => {
  const response = await apiClient.get(API_ROUTES.CHARACTERS.BY_ID(characterId));
  return response.data;
};

export const updateCharacter = async (id: number, characterData: Partial<CharacterCreateData>): Promise<CharacterData> => {
  const response = await apiClient.put(API_ROUTES.CHARACTERS.BY_ID(id.toString()), characterData);
  return response.data;
};

export const deleteCharacter = async (id: number): Promise<void> => {
  await apiClient.delete(API_ROUTES.CHARACTERS.BY_ID(id.toString()));
};

// Tipagens para itens
export type ItemData = {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  image_url?: string;
  price: number;
};

export type ItemCreateData = Omit<ItemData, 'id' | 'creator_id'>;
export type ItemUpdateData = Partial<Omit<ItemCreateData, 'name'>>;

// Funções para itens
export const getUserItems = async (): Promise<ItemData[]> => {
  const response = await apiClient.get(API_ROUTES.ITEMS.BASE);
  return response.data;
};

export const createItem = async (itemData: ItemCreateData): Promise<ItemData> => {
  const response = await apiClient.post(API_ROUTES.ITEMS.BASE, itemData);
  return response.data;
};

export const getItemById = async (itemId: string): Promise<ItemData> => {
  const response = await apiClient.get(API_ROUTES.ITEMS.BY_ID(itemId));
  return response.data;
};

export const updateItem = async (itemId: string, itemData: ItemUpdateData): Promise<ItemData> => {
  const response = await apiClient.put(API_ROUTES.ITEMS.BY_ID(itemId), itemData);
  return response.data;
};

export const deleteItem = async (itemId: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.ITEMS.BY_ID(itemId));
};

// Tipagens para monstros
export type MonsterData = {
  id: string;
  creator_id: string;
  name: string;
  size: string;
  type: string;
  armor_class: number;
  hit_points: string;
  speed: string;
  
  // Atributos D&D 5e
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Proficiências e resistências
  saving_throws: string | null;
  skills: string | null;
  damage_resistances: string | null;
  damage_immunities: string | null;
  condition_immunities: string | null;
  senses: string | null;
  languages: string | null;
  
  // Habilidades e ações
  special_abilities: string | null;
  actions: string | null;
  legendary_actions: string | null;
  reactions: string | null;
  
  challenge_rating: string;
  experience_points: number;
  
  // Informações adicionais
  description: string | null;
  environment: string | null;
};

export type MonsterCreateData = Omit<MonsterData, 'id' | 'creator_id'>;
export type MonsterUpdateData = Partial<Omit<MonsterCreateData, 'name'>>;

// Funções para monstros
export const getUserMonsters = async (): Promise<MonsterData[]> => {
  const response = await apiClient.get(API_ROUTES.MONSTERS.BASE);
  return response.data;
};

export const createMonster = async (monsterData: MonsterCreateData): Promise<MonsterData> => {
  const response = await apiClient.post(API_ROUTES.MONSTERS.BASE, monsterData);
  return response.data;
};

export const getMonsterById = async (monsterId: string): Promise<MonsterData> => {
  const response = await apiClient.get(API_ROUTES.MONSTERS.BY_ID(monsterId));
  return response.data;
};

export const updateMonster = async (monsterId: string, monsterData: MonsterUpdateData): Promise<MonsterData> => {
  const response = await apiClient.put(API_ROUTES.MONSTERS.BY_ID(monsterId), monsterData);
  return response.data;
};

export const deleteMonster = async (monsterId: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.MONSTERS.BY_ID(monsterId));
};

// Tipagens para NPCs
export type NpcData = {
  id: string;
  creator_id: string;
  name: string;
  
  // Informações básicas
  race: string;
  character_class: string;
  level: number;
  size: string;
  alignment: string | null;
  armor_class: number;
  hit_points: string;
  speed: string;
  
  // Atributos D&D 5e
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Proficiências e habilidades
  saving_throws: string | null;
  skills: string | null;
  damage_resistances: string | null;
  damage_immunities: string | null;
  condition_immunities: string | null;
  senses: string | null;
  languages: string | null;
  
  // Personalidade e interpretação
  personality_traits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  
  // Habilidades e ações
  special_abilities: string | null;
  actions: string | null;
  reactions: string | null;
  equipment: string[];
  
  // Informações narrativas
  description: string | null;
  backstory: string | null;
  role: string | null;
  location: string | null;
  faction: string | null;
  
  // Informações de jogo
  challenge_rating: string;
  experience_points: number;
  proficiency_bonus: string | null;
  
  // Notas do mestre
  notes: string | null;
  quest_hooks: string | null;
  adventure_hooks: string | null;
  relationships: string | null;
};

export type NpcCreateData = Omit<NpcData, 'id' | 'creator_id'>;
export type NpcUpdateData = Partial<Omit<NpcCreateData, 'name'>>;

// Funções para NPCs
export const getUserNpcs = async (): Promise<NpcData[]> => {
  const response = await apiClient.get(API_ROUTES.NPCS.BASE);
  return response.data;
};

export const createNpc = async (npcData: NpcCreateData): Promise<NpcData> => {
  const response = await apiClient.post(API_ROUTES.NPCS.BASE, npcData);
  return response.data;
};

export const getNpcById = async (npcId: string): Promise<NpcData> => {
  const response = await apiClient.get(API_ROUTES.NPCS.BY_ID(npcId));
  return response.data;
};

export const updateNpc = async (npcId: string, npcData: NpcUpdateData): Promise<NpcData> => {
  const response = await apiClient.put(API_ROUTES.NPCS.BY_ID(npcId), npcData);
  return response.data;
};

export const deleteNpc = async (npcId: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.NPCS.BY_ID(npcId));
};

// Tipagens para histórias
export type StoryData = {
  id: string;
  creator_id: string;
  title: string;
  synopsis: string | null;
  items: ItemData[];
  monsters: MonsterData[];
  npcs: NpcData[];
};

export type StoryCreateData = {
  title: string;
  synopsis: string | null;
  item_ids: string[];
  monster_ids: string[];
  npc_ids: string[];
};

export type StoryUpdateData = {
  title?: string;
  synopsis?: string | null;
  item_ids?: string[];
  monster_ids?: string[];
  npc_ids?: string[];
};

// Funções para histórias
export const getUserStories = async (): Promise<StoryData[]> => {
  const response = await apiClient.get(API_ROUTES.STORIES.BASE);
  return response.data;
};

// Funções para histórias
export const createStory = async (storyData: StoryCreateData): Promise<StoryData> => {
  const response = await apiClient.post(API_ROUTES.STORIES.BASE, storyData);
  return response.data;
};

export const getStoryById = async (storyId: string): Promise<StoryData> => {
  const response = await apiClient.get(API_ROUTES.STORIES.BY_ID(storyId));
  return response.data;
};

export const updateStory = async (storyId: string, storyData: StoryUpdateData): Promise<StoryData> => {
  const response = await apiClient.put(API_ROUTES.STORIES.BY_ID(storyId), storyData);
  return response.data;
};

export const deleteStory = async (storyId: string): Promise<void> => {
  await apiClient.delete(API_ROUTES.STORIES.BY_ID(storyId));
};

// Funções para perfil do usuário
export const getMe = async (): Promise<UserProfileData> => {
  const response = await apiClient.get(API_ROUTES.USER.PROFILE);
  return response.data;
};

export const updateUserMe = async (userData: UserUpdateData): Promise<UserProfileData> => {
  const response = await apiClient.put(API_ROUTES.USER.PROFILE, userData);
  return response.data;
};

export const uploadAvatar = async (avatarFile: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', avatarFile);
  
  const response = await apiClient.post(API_ROUTES.USER.AVATAR, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateMyNotificationSettings = async (settings: NotificationSettingsData): Promise<UserProfileData> => {
  const response = await apiClient.put(API_ROUTES.USER.NOTIFICATIONS, settings);
  return response.data;
};

// Função para importar dados de backup
export const importUserData = async (backupFile: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', backupFile);

  const response = await apiClient.post(API_ROUTES.USER.IMPORT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Tipagem para inventário agregado do usuário
export type UserInventoryData = {
  characters: CharacterData[];
  items: ItemData[];
  monsters: MonsterData[];
  npcs: NpcData[];
  stories: StoryData[];
};

// Função para buscar inventário completo do usuário
export const getMyInventory = async (): Promise<UserInventoryData> => {
  const response = await apiClient.get(API_ROUTES.USER.INVENTORY);
  return response.data;
};

// Funções para recuperação de senha
export const requestPasswordReset = async (email: string): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.REQUEST_PASSWORD_RESET, { email });
};

export const resetPassword = async (token: string, new_password: string): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, {
    token,
    new_password
  });
};

// Exportar o apiClient para uso direto quando necessário
export { apiClient };