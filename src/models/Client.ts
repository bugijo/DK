import { supabase, withRetry } from '../config/database';
import { Client, CreateClientData, UpdateClientData, ClientFilters, PaginationParams, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export class ClientModel {
  private static tableName = 'clients';

  // Criar novo cliente
  static async create(clientData: CreateClientData): Promise<Client> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(clientData)
        .select()
        .single();

      const duration = Date.now() - startTime;
      logger.database('INSERT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      }

      return data as Client;
    });
  }

  // Buscar cliente por ID
  static async findById(id: string): Promise<Client | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Registro não encontrado
        }
        throw new Error(`Erro ao buscar cliente: ${error.message}`);
      }

      return data as Client;
    });
  }

  // Buscar cliente por CPF
  static async findByCpf(cpf: string): Promise<Client | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cpf', cpf)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar cliente por CPF: ${error.message}`);
      }

      return data as Client;
    });
  }

  // Buscar cliente por email
  static async findByEmail(email: string): Promise<Client | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar cliente por email: ${error.message}`);
      }

      return data as Client;
    });
  }

  // Listar clientes com paginação e filtros
  static async findAll(
    pagination: PaginationParams = {},
    filters: ClientFilters = {}
  ): Promise<PaginatedResponse<Client>> {
    return withRetry(async () => {
      const startTime = Date.now();
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      const sortBy = pagination.sort_by || 'created_at';
      const sortOrder = pagination.sort_order || 'desc';

      // Construir query com filtros
      let query = supabase.from(this.tableName).select('*', { count: 'exact' });

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.cpf) {
        query = query.eq('cpf', filters.cpf);
      }

      // Aplicar ordenação e paginação
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao listar clientes: ${error.message}`);
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: data as Client[],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: limit,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      };
    });
  }

  // Atualizar cliente
  static async update(id: string, updateData: UpdateClientData): Promise<Client> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      const duration = Date.now() - startTime;
      logger.database('UPDATE', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      }

      return data as Client;
    });
  }

  // Deletar cliente (soft delete)
  static async delete(id: string): Promise<boolean> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      const duration = Date.now() - startTime;
      logger.database('DELETE', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao deletar cliente: ${error.message}`);
      }

      return true;
    });
  }

  // Verificar se CPF já existe
  static async cpfExists(cpf: string, excludeId?: string): Promise<boolean> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      let query = supabase
        .from(this.tableName)
        .select('id')
        .eq('cpf', cpf);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // CPF não existe
        }
        throw new Error(`Erro ao verificar CPF: ${error.message}`);
      }

      return !!data;
    });
  }

  // Verificar se email já existe
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      let query = supabase
        .from(this.tableName)
        .select('id')
        .eq('email', email);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // Email não existe
        }
        throw new Error(`Erro ao verificar email: ${error.message}`);
      }

      return !!data;
    });
  }

  // Contar total de clientes
  static async count(filters: ClientFilters = {}): Promise<number> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.cpf) {
        query = query.eq('cpf', filters.cpf);
      }

      const { count, error } = await query;

      const duration = Date.now() - startTime;
      logger.database('COUNT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao contar clientes: ${error.message}`);
      }

      return count || 0;
    });
  }
}