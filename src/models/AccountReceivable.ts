import { supabase } from '../config/database';
import { Logger } from '../utils/logger';

const logger = new Logger('AccountReceivable');

export interface IAccountReceivable {
  id?: string;
  description: string;
  value: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  client_id: string;
  origin: 'consultation' | 'product_sale' | 'service' | 'other';
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class AccountReceivable {
  // Método para criar uma nova conta a receber
  static async create(accountData: Omit<IAccountReceivable, 'id' | 'created_at' | 'updated_at'>): Promise<IAccountReceivable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('create', 'accounts_receivable', accountData);
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert([accountData])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar conta a receber:', error);
        throw new Error(`Erro ao criar conta a receber: ${error.message}`);
      }

      logger.info('Conta a receber criada com sucesso:', data.id);
      return data;
    });
  }

  // Método para buscar conta a receber por ID
  static async findById(id: string): Promise<IAccountReceivable | null> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findById', 'accounts_receivable', { id });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          client:clients(id, name, cpf)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar conta a receber por ID:', error);
        throw new Error(`Erro ao buscar conta a receber: ${error.message}`);
      }

      return data;
    });
  }

  // Método para buscar contas a receber por cliente
  static async findByClient(clientId: string): Promise<IAccountReceivable[]> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findByClient', 'accounts_receivable', { clientId });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('client_id', clientId)
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar contas a receber por cliente:', error);
        throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
      }

      return data || [];
    });
  }

  // Método para buscar contas a receber por status
  static async findByStatus(status: 'pending' | 'paid' | 'overdue'): Promise<IAccountReceivable[]> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findByStatus', 'accounts_receivable', { status });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          client:clients(id, name, cpf)
        `)
        .eq('status', status)
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar contas a receber por status:', error);
        throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
      }

      return data || [];
    });
  }

  // Método para buscar contas a receber por origem
  static async findByOrigin(origin: 'consultation' | 'product_sale' | 'service' | 'other'): Promise<IAccountReceivable[]> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findByOrigin', 'accounts_receivable', { origin });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          client:clients(id, name, cpf)
        `)
        .eq('origin', origin)
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar contas a receber por origem:', error);
        throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
      }

      return data || [];
    });
  }

  // Método para listar contas a receber com paginação
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      status?: 'pending' | 'paid' | 'overdue';
      client_id?: string;
      origin?: 'consultation' | 'product_sale' | 'service' | 'other';
      due_date_from?: string;
      due_date_to?: string;
    } = {}
  ): Promise<{ accounts: IAccountReceivable[]; total: number; page: number; limit: number }> {
    return this.withRetry(async () => {
      const offset = (page - 1) * limit;
      
      logger.logDatabaseOperation('findAll', 'accounts_receivable', { page, limit, filters });
      
      let query = supabase
        .from('accounts_receivable')
        .select(`
          *,
          client:clients(id, name, cpf)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters.origin) {
        query = query.eq('origin', filters.origin);
      }
      if (filters.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }
      if (filters.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      const { data, error, count } = await query
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Erro ao listar contas a receber:', error);
        throw new Error(`Erro ao listar contas a receber: ${error.message}`);
      }

      return {
        accounts: data || [],
        total: count || 0,
        page,
        limit,
      };
    });
  }

  // Método para atualizar conta a receber
  static async update(id: string, updateData: Partial<Omit<IAccountReceivable, 'id' | 'created_at' | 'updated_at'>>): Promise<IAccountReceivable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('update', 'accounts_receivable', { id, updateData });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar conta a receber:', error);
        throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
      }

      if (!data) {
        throw new Error('Conta a receber não encontrada');
      }

      logger.info('Conta a receber atualizada com sucesso:', id);
      return data;
    });
  }

  // Método para marcar como pago
  static async markAsPaid(id: string): Promise<IAccountReceivable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('markAsPaid', 'accounts_receivable', { id });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao marcar conta como paga:', error);
        throw new Error(`Erro ao marcar conta como paga: ${error.message}`);
      }

      if (!data) {
        throw new Error('Conta a receber não encontrada');
      }

      logger.info('Conta marcada como paga com sucesso:', id);
      return data;
    });
  }

  // Método para marcar como vencido
  static async markAsOverdue(id: string): Promise<IAccountReceivable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('markAsOverdue', 'accounts_receivable', { id });
      
      const { data, error } = await supabase
        .from('accounts_receivable')
        .update({ 
          status: 'overdue',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao marcar conta como vencida:', error);
        throw new Error(`Erro ao marcar conta como vencida: ${error.message}`);
      }

      if (!data) {
        throw new Error('Conta a receber não encontrada');
      }

      logger.info('Conta marcada como vencida com sucesso:', id);
      return data;
    });
  }

  // Método para deletar conta a receber
  static async delete(id: string): Promise<void> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('delete', 'accounts_receivable', { id });
      
      const { error } = await supabase
        .from('accounts_receivable')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar conta a receber:', error);
        throw new Error(`Erro ao deletar conta a receber: ${error.message}`);
      }

      logger.info('Conta a receber deletada com sucesso:', id);
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
