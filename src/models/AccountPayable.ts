import { supabase } from '../config/database';
import { Logger } from '../utils/logger';

const logger = new Logger('AccountPayable');

export interface IAccountPayable {
  id?: string;
  description: string;
  value: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  supplier_id: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class AccountPayable {
  // Método para criar uma nova conta a pagar
  static async create(accountData: Omit<IAccountPayable, 'id' | 'created_at' | 'updated_at'>): Promise<IAccountPayable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('create', 'accounts_payable', accountData);
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert([accountData])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar conta a pagar:', error);
        throw new Error(`Erro ao criar conta a pagar: ${error.message}`);
      }

      logger.info('Conta a pagar criada com sucesso:', data.id);
      return data;
    });
  }

  // Método para buscar conta a pagar por ID
  static async findById(id: string): Promise<IAccountPayable | null> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findById', 'accounts_payable', { id });
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          supplier:suppliers(id, name, cnpj)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar conta a pagar por ID:', error);
        throw new Error(`Erro ao buscar conta a pagar: ${error.message}`);
      }

      return data;
    });
  }

  // Método para buscar contas a pagar por fornecedor
  static async findBySupplier(supplierId: string): Promise<IAccountPayable[]> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findBySupplier', 'accounts_payable', { supplierId });
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar contas a pagar por fornecedor:', error);
        throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
      }

      return data || [];
    });
  }

  // Método para buscar contas a pagar por status
  static async findByStatus(status: 'pending' | 'paid' | 'overdue'): Promise<IAccountPayable[]> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('findByStatus', 'accounts_payable', { status });
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          supplier:suppliers(id, name, cnpj)
        `)
        .eq('status', status)
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar contas a pagar por status:', error);
        throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
      }

      return data || [];
    });
  }

  // Método para listar contas a pagar com paginação
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      status?: 'pending' | 'paid' | 'overdue';
      supplier_id?: string;
      due_date_from?: string;
      due_date_to?: string;
    } = {}
  ): Promise<{ accounts: IAccountPayable[]; total: number; page: number; limit: number }> {
    return this.withRetry(async () => {
      const offset = (page - 1) * limit;
      
      logger.logDatabaseOperation('findAll', 'accounts_payable', { page, limit, filters });
      
      let query = supabase
        .from('accounts_payable')
        .select(`
          *,
          supplier:suppliers(id, name, cnpj)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
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
        logger.error('Erro ao listar contas a pagar:', error);
        throw new Error(`Erro ao listar contas a pagar: ${error.message}`);
      }

      return {
        accounts: data || [],
        total: count || 0,
        page,
        limit,
      };
    });
  }

  // Método para atualizar conta a pagar
  static async update(id: string, updateData: Partial<Omit<IAccountPayable, 'id' | 'created_at' | 'updated_at'>>): Promise<IAccountPayable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('update', 'accounts_payable', { id, updateData });
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar conta a pagar:', error);
        throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
      }

      if (!data) {
        throw new Error('Conta a pagar não encontrada');
      }

      logger.info('Conta a pagar atualizada com sucesso:', id);
      return data;
    });
  }

  // Método para marcar como pago
  static async markAsPaid(id: string): Promise<IAccountPayable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('markAsPaid', 'accounts_payable', { id });
      
      const { data, error } = await supabase
        .from('accounts_payable')
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
        throw new Error('Conta a pagar não encontrada');
      }

      logger.info('Conta marcada como paga com sucesso:', id);
      return data;
    });
  }

  // Método para marcar como vencido
  static async markAsOverdue(id: string): Promise<IAccountPayable> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('markAsOverdue', 'accounts_payable', { id });
      
      const { data, error } = await supabase
        .from('accounts_payable')
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
        throw new Error('Conta a pagar não encontrada');
      }

      logger.info('Conta marcada como vencida com sucesso:', id);
      return data;
    });
  }

  // Método para deletar conta a pagar
  static async delete(id: string): Promise<void> {
    return this.withRetry(async () => {
      logger.logDatabaseOperation('delete', 'accounts_payable', { id });
      
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar conta a pagar:', error);
        throw new Error(`Erro ao deletar conta a pagar: ${error.message}`);
      }

      logger.info('Conta a pagar deletada com sucesso:', id);
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
