import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import { Product } from './Product';

export interface IStockMovement {
  id?: string;
  product_id: string;
  type: 'entry' | 'sale' | 'adjustment' | 'internal_use';
  quantity: number;
  unit_cost?: number;
  unit_price?: number;
  reason?: string;
  related_to?: Record<string, any>;
  user_id: string;
  created_at?: string;
}

export interface IStockMovementFilters {
  product_id?: string;
  type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export interface IStockMovementWithDetails extends IStockMovement {
  product_name?: string;
  product_unit?: string;
  user_name?: string;
  stock_before?: number;
  stock_after?: number;
}

export interface IStockMovementSummary {
  total_movements: number;
  total_entries: number;
  total_sales: number;
  total_adjustments: number;
  total_internal_use: number;
  value_entries: number;
  value_sales: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export class StockMovement {
  static async create(movementData: Omit<IStockMovement, 'id' | 'created_at'>): Promise<IStockMovement> {
    try {
      // Verificar se o produto existe
      const product = await Product.findById(movementData.product_id);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      // Calcular novo estoque
      let newStock = product.current_stock;
      if (movementData.type === 'entry') {
        newStock += movementData.quantity;
      } else {
        newStock -= movementData.quantity;
      }

      if (newStock < 0) {
        throw new Error('Estoque insuficiente para esta operação');
      }

      // Iniciar transação
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(movementData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar movimentação de estoque:', error);
        throw new Error(`Erro ao criar movimentação: ${error.message}`);
      }

      // Atualizar estoque do produto
      await Product.updateStock(movementData.product_id, newStock);

      logger.info(`Movimentação de estoque criada: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Erro ao criar movimentação de estoque:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<IStockMovement | null> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar movimentação por ID:', error);
        throw new Error(`Erro ao buscar movimentação: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Erro ao buscar movimentação por ID:', error);
      throw error;
    }
  }

  static async findByIdWithDetails(id: string): Promise<IStockMovementWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products(name, unit),
          users(name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar movimentação com detalhes:', error);
        throw new Error(`Erro ao buscar movimentação: ${error.message}`);
      }

      const movement: IStockMovementWithDetails = {
        ...data,
        product_name: data.products?.name,
        product_unit: data.products?.unit,
        user_name: data.users?.name
      };

      delete (movement as any).products;
      delete (movement as any).users;
      return movement;
    } catch (error) {
      logger.error('Erro ao buscar movimentação com detalhes:', error);
      throw error;
    }
  }

  static async findAll(filters: IStockMovementFilters = {}, page = 1, limit = 10): Promise<{
    movements: IStockMovementWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          products(name, unit),
          users(name)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.product_id) {
        query = query.eq('product_id', filters.product_id);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      if (filters.reason) {
        query = query.ilike('reason', `%${filters.reason}%`);
      }

      // Paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Ordenação
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        logger.error('Erro ao buscar movimentações:', error);
        throw new Error(`Erro ao buscar movimentações: ${error.message}`);
      }

      const movements: IStockMovementWithDetails[] = (data || []).map(movement => ({
        ...movement,
        product_name: movement.products?.name,
        product_unit: movement.products?.unit,
        user_name: movement.users?.name
      }));

      // Remove as propriedades aninhadas
      movements.forEach(movement => {
        delete (movement as any).products;
        delete (movement as any).users;
      });

      return {
        movements,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      logger.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  }

  static async findByProductId(productId: string, page = 1, limit = 10): Promise<{
    movements: IStockMovementWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.findAll({ product_id: productId }, page, limit);
  }

  static async findByType(type: string, page = 1, limit = 10): Promise<{
    movements: IStockMovementWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.findAll({ type }, page, limit);
  }

  static async findByDateRange(startDate: string, endDate: string, page = 1, limit = 10): Promise<{
    movements: IStockMovementWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.findAll({ start_date: startDate, end_date: endDate }, page, limit);
  }

  static async getSummary(filters: IStockMovementFilters = {}): Promise<IStockMovementSummary> {
    try {
      let query = supabase
        .from('stock_movements')
        .select('type, quantity, unit_cost, unit_price, created_at');

      // Aplicar filtros
      if (filters.product_id) {
        query = query.eq('product_id', filters.product_id);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Erro ao buscar resumo de movimentações:', error);
        throw new Error(`Erro ao buscar resumo: ${error.message}`);
      }

      const movements = data || [];
      
      const summary: IStockMovementSummary = {
        total_movements: movements.length,
        total_entries: movements.filter(m => m.type === 'entry').length,
        total_sales: movements.filter(m => m.type === 'sale').length,
        total_adjustments: movements.filter(m => m.type === 'adjustment').length,
        total_internal_use: movements.filter(m => m.type === 'internal_use').length,
        value_entries: movements
          .filter(m => m.type === 'entry' && m.unit_cost)
          .reduce((sum, m) => sum + (m.quantity * (m.unit_cost || 0)), 0),
        value_sales: movements
          .filter(m => m.type === 'sale' && m.unit_price)
          .reduce((sum, m) => sum + (m.quantity * (m.unit_price || 0)), 0),
        period: {
          start_date: filters.start_date || '',
          end_date: filters.end_date || ''
        }
      };

      return summary;
    } catch (error) {
      logger.error('Erro ao buscar resumo de movimentações:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      // Buscar a movimentação antes de deletar para reverter o estoque
      const movement = await this.findById(id);
      if (!movement) {
        throw new Error('Movimentação não encontrada');
      }

      // Buscar produto atual
      const product = await Product.findById(movement.product_id);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      // Calcular estoque após reversão
      let newStock = product.current_stock;
      if (movement.type === 'entry') {
        newStock -= movement.quantity; // Reverter entrada
      } else {
        newStock += movement.quantity; // Reverter saída
      }

      if (newStock < 0) {
        throw new Error('Não é possível deletar: resultaria em estoque negativo');
      }

      // Deletar movimentação
      const { error } = await supabase
        .from('stock_movements')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar movimentação:', error);
        throw new Error(`Erro ao deletar movimentação: ${error.message}`);
      }

      // Atualizar estoque do produto
      await Product.updateStock(movement.product_id, newStock);

      logger.info(`Movimentação deletada com sucesso: ${id}`);
    } catch (error) {
      logger.error('Erro ao deletar movimentação:', error);
      throw error;
    }
  }

  // Métodos específicos para tipos de movimentação
  static async createInternalUse(data: {
    product_id: string;
    quantity: number;
    reason?: string;
    related_to?: Record<string, any>;
    user_id: string;
  }): Promise<IStockMovement> {
    return this.create({
      ...data,
      type: 'internal_use'
    });
  }

  static async createSale(data: {
    product_id: string;
    quantity: number;
    unit_price: number;
    related_to?: Record<string, any>;
    user_id: string;
  }): Promise<IStockMovement> {
    return this.create({
      ...data,
      type: 'sale'
    });
  }

  static async createEntry(data: {
    product_id: string;
    quantity: number;
    unit_cost?: number;
    reason?: string;
    related_to?: Record<string, any>;
    user_id: string;
  }): Promise<IStockMovement> {
    return this.create({
      ...data,
      type: 'entry'
    });
  }
}
