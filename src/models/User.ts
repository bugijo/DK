import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase, withRetry } from '../config/database';
import { User, CreateUserData, UpdateUserData, UserFilters, PaginationParams, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export class UserModel {
  private static tableName = 'users';
  private static saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

  // Hash da senha
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  // Verificar senha
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Criar novo usuário
  static async create(userData: CreateUserData): Promise<Omit<User, 'password_hash'>> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const passwordHash = await this.hashPassword(userData.password);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          name: userData.name,
          email: userData.email,
          password_hash: passwordHash,
          role: userData.role,
        })
        .select('id, name, email, role, created_at, updated_at')
        .single();

      const duration = Date.now() - startTime;
      logger.database('INSERT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }

      return data as Omit<User, 'password_hash'>;
    });
  }

  // Buscar usuário por ID (sem senha)
  static async findById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, name, email, role, created_at, updated_at')
        .eq('id', id)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Registro não encontrado
        }
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
      }

      return data as Omit<User, 'password_hash'>;
    });
  }

  // Buscar usuário por email (com senha para autenticação)
  static async findByEmailWithPassword(email: string): Promise<User | null> {
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
        throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
      }

      return data as User;
    });
  }

  // Buscar usuário por email (sem senha)
  static async findByEmail(email: string): Promise<Omit<User, 'password_hash'> | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, name, email, role, created_at, updated_at')
        .eq('email', email)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
      }

      return data as Omit<User, 'password_hash'>;
    });
  }

  // Listar usuários com paginação e filtros
  static async findAll(
    pagination: PaginationParams = {},
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    return withRetry(async () => {
      const startTime = Date.now();
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      const sortBy = pagination.sort_by || 'created_at';
      const sortOrder = pagination.sort_order || 'desc';

      // Construir query com filtros
      let query = supabase
        .from(this.tableName)
        .select('id, name, email, role, created_at, updated_at', { count: 'exact' });

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      // Aplicar ordenação e paginação
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao listar usuários: ${error.message}`);
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: data as Omit<User, 'password_hash'>[],
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

  // Atualizar usuário
  static async update(id: string, updateData: UpdateUserData): Promise<Omit<User, 'password_hash'>> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, name, email, role, created_at, updated_at')
        .single();

      const duration = Date.now() - startTime;
      logger.database('UPDATE', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

      return data as Omit<User, 'password_hash'>;
    });
  }

  // Deletar usuário (soft delete)
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
        throw new Error(`Erro ao deletar usuário: ${error.message}`);
      }

      return true;
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

  // Contar total de usuários
  static async count(filters: UserFilters = {}): Promise<number> {
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
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      const { count, error } = await query;

      const duration = Date.now() - startTime;
      logger.database('COUNT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao contar usuários: ${error.message}`);
      }

      return count || 0;
    });
  }

  // Buscar usuários por role
  static async findByRole(role: string): Promise<Omit<User, 'password_hash'>[]> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, name, email, role, created_at, updated_at')
        .eq('role', role)
        .order('name', { ascending: true });

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao buscar usuários por role: ${error.message}`);
      }

      return (data || []) as Omit<User, 'password_hash'>[];
    });
  }
}