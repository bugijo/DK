import { supabase } from '../config/database';
import { Logger } from '../utils/logger';

const logger = new Logger('Supplier');

export interface ISupplier {
  id?: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export class Supplier {
  // Método para criar um novo fornecedor
  static async create(supplierData: Omit<ISupplier, 'id' | 'created_at' | 'updated_at'>): Promise<ISupplier> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('create', 'suppliers', supplierData);
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar fornecedor:', error);
        throw new Error(`Erro ao criar fornecedor: ${error.message}`);
      }

      logger.info('Fornecedor criado com sucesso:', data.id);
      return data;
    });
  }

  // Método para buscar fornecedor por ID
  static async findById(id: string): Promise<ISupplier | null> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findById', 'suppliers', { id });
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar fornecedor por ID:', error);
        throw new Error(`Erro ao buscar fornecedor: ${error.message}`);
      }

      return data;
    });
  }

  // Método para buscar fornecedor por CNPJ
  static async findByCnpj(cnpj: string): Promise<ISupplier | null> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findByCnpj', 'suppliers', { cnpj });
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('cnpj', cnpj)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar fornecedor por CNPJ:', error);
        throw new Error(`Erro ao buscar fornecedor: ${error.message}`);
      }

      return data;
    });
  }

  // Método para listar fornecedores com paginação
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      name?: string;
      cnpj?: string;
      email?: string;
    } = {}
  ): Promise<{ suppliers: ISupplier[]; total: number; page: number; limit: number }> {
    return this.withRetry(async () => {
      const offset = (page - 1) * limit;
      
      logger.logDatabaseOperation('findAll', 'suppliers', { page, limit, filters });
      
      let query = supabase
        .from('suppliers')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.cnpj) {
        query = query.eq('cnpj', filters.cnpj);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Erro ao listar fornecedores:', error);
        throw new Error(`Erro ao listar fornecedores: ${error.message}`);
      }

      return {
        suppliers: data || [],
        total: count || 0,
        page,
        limit,
      };
    });
  }

  // Método para atualizar fornecedor
  static async update(id: string, updateData: Partial<Omit<ISupplier, 'id' | 'created_at' | 'updated_at'>>): Promise<ISupplier> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('update', 'suppliers', { id, updateData });
      
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar fornecedor:', error);
        throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
      }

      if (!data) {
        throw new Error('Fornecedor não encontrado');
      }

      logger.info('Fornecedor atualizado com sucesso:', id);
      return data;
    });
  }

  // Método para deletar fornecedor
  static async delete(id: string): Promise<void> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('delete', 'suppliers', { id });
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar fornecedor:', error);
        throw new Error(`Erro ao deletar fornecedor: ${error.message}`);
      }

      logger.info('Fornecedor deletado com sucesso:', id);
    });
  }

  // Método auxiliar para retry de operações
  private static async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Tentativa ${attempt} falhou:`, error);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Aguardar antes da próxima tentativa (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError!;
  }
}
