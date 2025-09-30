import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export interface IProduct {
  id?: string;
  name: string;
  description?: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock: number;
  supplier_id?: string;
  category?: string;
  unit?: string;
  barcode?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IProductFilters {
  name?: string;
  category?: string;
  supplier_id?: string;
  low_stock?: boolean;
  is_active?: boolean;
  barcode?: string;
}

export interface IProductWithDetails extends IProduct {
  supplier_name?: string;
  stock_status?: 'normal' | 'low' | 'out';
}

export class Product {
  static async create(productData: Omit<IProduct, 'id' | 'created_at' | 'updated_at'>): Promise<IProduct> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          is_active: productData.is_active ?? true
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar produto:', error);
        throw new Error(`Erro ao criar produto: ${error.message}`);
      }

      logger.info(`Produto criado com sucesso: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<IProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar produto por ID:', error);
        throw new Error(`Erro ao buscar produto: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Erro ao buscar produto por ID:', error);
      throw error;
    }
  }

  static async findByIdWithDetails(id: string): Promise<IProductWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers(name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar produto com detalhes:', error);
        throw new Error(`Erro ao buscar produto: ${error.message}`);
      }

      const product: IProductWithDetails = {
        ...data,
        supplier_name: data.suppliers?.name,
        stock_status: data.current_stock <= 0 ? 'out' : 
                     data.current_stock <= data.min_stock ? 'low' : 'normal'
      };

      delete (product as any).suppliers;
      return product;
    } catch (error) {
      logger.error('Erro ao buscar produto com detalhes:', error);
      throw error;
    }
  }

  static async findAll(filters: IProductFilters = {}, page = 1, limit = 10): Promise<{
    products: IProductWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          suppliers(name)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters.barcode) {
        query = query.eq('barcode', filters.barcode);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.low_stock) {
        query = query.filter('current_stock', 'lte', 'min_stock');
      }

      // Paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Ordenação
      query = query.order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        logger.error('Erro ao buscar produtos:', error);
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      const products: IProductWithDetails[] = (data || []).map(product => ({
        ...product,
        supplier_name: product.suppliers?.name,
        stock_status: product.current_stock <= 0 ? 'out' : 
                     product.current_stock <= product.min_stock ? 'low' : 'normal'
      }));

      // Remove a propriedade suppliers dos objetos
      products.forEach(product => {
        delete (product as any).suppliers;
      });

      return {
        products,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      logger.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  static async update(id: string, productData: Partial<IProduct>): Promise<IProduct> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar produto:', error);
        throw new Error(`Erro ao atualizar produto: ${error.message}`);
      }

      logger.info(`Produto atualizado com sucesso: ${id}`);
      return data;
    } catch (error) {
      logger.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  static async updateStock(id: string, newStock: number): Promise<IProduct> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar estoque do produto:', error);
        throw new Error(`Erro ao atualizar estoque: ${error.message}`);
      }

      logger.info(`Estoque do produto ${id} atualizado para ${newStock}`);
      return data;
    } catch (error) {
      logger.error('Erro ao atualizar estoque do produto:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar produto:', error);
        throw new Error(`Erro ao deletar produto: ${error.message}`);
      }

      logger.info(`Produto deletado com sucesso: ${id}`);
    } catch (error) {
      logger.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  static async findLowStock(): Promise<IProductWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers(name)
        `)
        .filter('current_stock', 'lte', 'min_stock')
        .eq('is_active', true)
        .order('current_stock', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar produtos com estoque baixo:', error);
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      const products: IProductWithDetails[] = (data || []).map(product => ({
        ...product,
        supplier_name: product.suppliers?.name,
        stock_status: product.current_stock <= 0 ? 'out' : 'low'
      }));

      // Remove a propriedade suppliers dos objetos
      products.forEach(product => {
        delete (product as any).suppliers;
      });

      return products;
    } catch (error) {
      logger.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }

  static async findByBarcode(barcode: string): Promise<IProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Erro ao buscar produto por código de barras:', error);
        throw new Error(`Erro ao buscar produto: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Erro ao buscar produto por código de barras:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
        .eq('is_active', true);

      if (error) {
        logger.error('Erro ao buscar categorias:', error);
        throw new Error(`Erro ao buscar categorias: ${error.message}`);
      }

      const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      logger.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }
}
