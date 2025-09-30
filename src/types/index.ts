// Entidade base
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Cliente
export interface Client extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

// Pet
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';

export interface Pet extends BaseEntity {
  name: string;
  species: PetSpecies;
  breed?: string;
  color?: string;
  birth_date?: string;
  weight?: number;
  microchip?: string;
  notes?: string;
  client_id: string;
  client?: Client; // Incluído quando necessário
}

export interface CreatePetData {
  name: string;
  species: PetSpecies;
  breed?: string;
  color?: string;
  birth_date?: string;
  weight?: number;
  microchip?: string;
  notes?: string;
  client_id: string;
}

export interface UpdatePetData {
  name?: string;
  species?: PetSpecies;
  breed?: string;
  color?: string;
  birth_date?: string;
  weight?: number;
  microchip?: string;
  notes?: string;
  client_id?: string;
}

// Usuário
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: 'admin' | 'vet' | 'assistant';
  is_active: boolean;
  last_login?: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'vet' | 'assistant';
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'vet' | 'assistant';
  is_active?: boolean;
}

// Filtros
export interface ClientFilters {
  name?: string;
  email?: string;
  cpf?: string;
  city?: string;
  state?: string;
}

export interface PetFilters {
  name?: string;
  species?: PetSpecies;
  client_id?: string;
  breed?: string;
}

export interface UserFilters {
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
}

// Paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// JWT
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Request customizado
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Resposta da API
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Logs
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  data?: any;
}

// Estatísticas
export interface DashboardStats {
  total_clients: number;
  total_pets: number;
  total_users: number;
  recent_clients: Client[];
  recent_pets: Pet[];
  pets_by_species: {
    species: PetSpecies;
    count: number;
  }[];
}