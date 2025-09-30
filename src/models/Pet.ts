import { supabase, withRetry } from '../config/database';
import { Pet, CreatePetData, UpdatePetData, PetFilters, PaginationParams, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export class PetModel {
  private static tableName = 'pets';

  // Criar novo pet
  static async create(petData: CreatePetData): Promise<Pet> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(petData)
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      const duration = Date.now() - startTime;
      logger.database('INSERT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao criar pet: ${error.message}`);
      }

      if (!data) {
        throw new Error('Erro ao criar pet: dados não retornados');
      }

      return data as Pet;
    });
  }

  // Buscar pet por ID
  static async findById(id: string, includeClient: boolean = true): Promise<Pet | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const selectFields = includeClient 
        ? `*, client:clients(*)` 
        : '*';
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select(selectFields)
        .eq('id', id)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Registro não encontrado
        }
        throw new Error(`Erro ao buscar pet: ${error.message}`);
      }

      if (!data) return null;
      
      // Type assertion baseado no includeClient
      return includeClient 
        ? ({ ...(data as any), client: (data as any).client || undefined } as Pet)
        : ((data as any) as Pet);
    });
  }

  // Buscar pet por microchip
  static async findByMicrochip(microchip: string): Promise<Pet | null> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(*)
        `)
        .eq('microchip', microchip)
        .single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar pet por microchip: ${error.message}`);
      }

      return data as Pet;
    });
  }

  // Buscar pets por cliente
  static async findByClientId(clientId: string): Promise<Pet[]> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('client_id', clientId)
        .order('name', { ascending: true });

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao buscar pets do cliente: ${error.message}`);
      }

      return (data || []) as Pet[];
    });
  }

  // Listar pets com paginação e filtros
  static async findAll(
    pagination: PaginationParams = {},
    filters: PetFilters = {},
    includeClient: boolean = true
  ): Promise<PaginatedResponse<Pet>> {
    return withRetry(async () => {
      const startTime = Date.now();
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      const sortBy = pagination.sort_by || 'created_at';
      const sortOrder = pagination.sort_order || 'desc';

      const selectFields = includeClient 
        ? `*, client:clients(*)` 
        : '*';

      // Construir query com filtros
      let query = supabase.from(this.tableName).select(selectFields, { count: 'exact' });

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.species) {
        query = query.eq('species', filters.species);
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      // Aplicar ordenação e paginação
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao listar pets: ${error.message}`);
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / limit);

      // Type assertion baseado no includeClient
      const pets: Pet[] = includeClient 
        ? (data || []).map((item: any) => ({
            ...item,
            client: item.client || undefined
          } as Pet))
        : ((data || []) as any[]).map(item => item as Pet);

      return {
        data: pets,
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

  // Atualizar pet
  static async update(id: string, updateData: UpdatePetData): Promise<Pet> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      const duration = Date.now() - startTime;
      logger.database('UPDATE', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao atualizar pet: ${error.message}`);
      }

      return data as Pet;
    });
  }

  // Deletar pet (soft delete)
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
        throw new Error(`Erro ao deletar pet: ${error.message}`);
      }

      return true;
    });
  }

  // Verificar se microchip já existe
  static async microchipExists(microchip: string, excludeId?: string): Promise<boolean> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      let query = supabase
        .from(this.tableName)
        .select('id')
        .eq('microchip', microchip);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.single();

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // Microchip não existe
        }
        throw new Error(`Erro ao verificar microchip: ${error.message}`);
      }

      return !!data;
    });
  }

  // Contar total de pets
  static async count(filters: PetFilters = {}): Promise<number> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.species) {
        query = query.eq('species', filters.species);
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      const { count, error } = await query;

      const duration = Date.now() - startTime;
      logger.database('COUNT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao contar pets: ${error.message}`);
      }

      return count || 0;
    });
  }

  // Buscar pets por espécie
  static async findBySpecies(species: string): Promise<Pet[]> {
    return withRetry(async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(*)
        `)
        .eq('species', species)
        .order('name', { ascending: true });

      const duration = Date.now() - startTime;
      logger.database('SELECT', this.tableName, duration, error || undefined);

      if (error) {
        throw new Error(`Erro ao buscar pets por espécie: ${error.message}`);
      }

      return (data || []) as Pet[];
    });
  }
}