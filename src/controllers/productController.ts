import { Request, Response } from 'express';
import { Product, IProduct, IProductFilters } from '../models/Product';
import { logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

export class ProductController {
  // Criar produto
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const productData: Omit<IProduct, 'id' | 'created_at' | 'updated_at'> = req.body;

      // Verificar se já existe produto com o mesmo código de barras
      if (productData.barcode) {
        const existingProduct = await Product.findByBarcode(productData.barcode);
        if (existingProduct) {
          res.status(400).json({
            error: 'Já existe um produto com este código de barras'
          });
          return;
        }
      }

      const product = await Product.create(productData);
      
      res.status(201).json({
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      logger.error('Erro no ProductController.create:', error);
      handleError(error, req, res);
    }
  }

  // Buscar produto por ID
  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.json({
        message: 'Produto encontrado',
        data: product
      });
    } catch (error) {
      logger.error('Erro no ProductController.findById:', error);
      handleError(error, req, res);
    }
  }

  // Buscar produto por ID com detalhes
  static async findByIdWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findByIdWithDetails(id);

      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.json({
        message: 'Produto encontrado',
        data: product
      });
    } catch (error) {
      logger.error('Erro no ProductController.findByIdWithDetails:', error);
      handleError(error, req, res);
    }
  }

  // Listar produtos com filtros e paginação
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: IProductFilters = {
        name: req.query.name as string,
        category: req.query.category as string,
        supplier_id: req.query.supplier_id as string,
        barcode: req.query.barcode as string,
        low_stock: req.query.low_stock === 'true',
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof IProductFilters] === undefined || filters[key as keyof IProductFilters] === '') {
          delete filters[key as keyof IProductFilters];
        }
      });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await Product.findAll(filters, page, limit);

      res.json({
        message: 'Produtos encontrados',
        data: result.products,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no ProductController.findAll:', error);
      handleError(error, req, res);
    }
  }

  // Atualizar produto
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productData: Partial<IProduct> = req.body;

      // Verificar se o produto existe
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      // Verificar código de barras duplicado (se estiver sendo alterado)
      if (productData.barcode && productData.barcode !== existingProduct.barcode) {
        const productWithBarcode = await Product.findByBarcode(productData.barcode);
        if (productWithBarcode && productWithBarcode.id !== id) {
          res.status(400).json({
            error: 'Já existe um produto com este código de barras'
          });
          return;
        }
      }

      const updatedProduct = await Product.update(id, productData);

      res.json({
        message: 'Produto atualizado com sucesso',
        data: updatedProduct
      });
    } catch (error) {
      logger.error('Erro no ProductController.update:', error);
      handleError(error, req, res);
    }
  }

  // Atualizar estoque do produto
  static async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { current_stock } = req.body;

      // Verificar se o produto existe
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      const updatedProduct = await Product.updateStock(id, current_stock);

      res.json({
        message: 'Estoque atualizado com sucesso',
        data: updatedProduct
      });
    } catch (error) {
      logger.error('Erro no ProductController.updateStock:', error);
      handleError(error, req, res);
    }
  }

  // Deletar produto
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se o produto existe
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      await Product.delete(id);

      res.json({
        message: 'Produto deletado com sucesso'
      });
    } catch (error) {
      logger.error('Erro no ProductController.delete:', error);
      handleError(error, req, res);
    }
  }

  // Buscar produtos com estoque baixo
  static async findLowStock(req: Request, res: Response): Promise<void> {
    try {
      const products = await Product.findLowStock();

      res.json({
        message: 'Produtos com estoque baixo encontrados',
        data: products,
        count: products.length
      });
    } catch (error) {
      logger.error('Erro no ProductController.findLowStock:', error);
      handleError(error, req, res);
    }
  }

  // Buscar produto por código de barras
  static async findByBarcode(req: Request, res: Response): Promise<void> {
    try {
      const { barcode } = req.params;
      const product = await Product.findByBarcode(barcode);

      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.json({
        message: 'Produto encontrado',
        data: product
      });
    } catch (error) {
      logger.error('Erro no ProductController.findByBarcode:', error);
      handleError(error, req, res);
    }
  }

  // Buscar categorias de produtos
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Product.getCategories();

      res.json({
        message: 'Categorias encontradas',
        data: categories
      });
    } catch (error) {
      logger.error('Erro no ProductController.getCategories:', error);
      handleError(error, req, res);
    }
  }

  // Buscar produtos por fornecedor
  static async findBySupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await Product.findAll({ supplier_id: supplierId }, page, limit);

      res.json({
        message: 'Produtos do fornecedor encontrados',
        data: result.products,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no ProductController.findBySupplier:', error);
      handleError(error, req, res);
    }
  }

  // Buscar produtos por categoria
  static async findByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await Product.findAll({ category }, page, limit);

      res.json({
        message: 'Produtos da categoria encontrados',
        data: result.products,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no ProductController.findByCategory:', error);
      handleError(error, req, res);
    }
  }

  // Ativar/Desativar produto
  static async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se o produto existe
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      const updatedProduct = await Product.update(id, {
        is_active: !existingProduct.is_active
      });

      res.json({
        message: `Produto ${updatedProduct.is_active ? 'ativado' : 'desativado'} com sucesso`,
        data: updatedProduct
      });
    } catch (error) {
      logger.error('Erro no ProductController.toggleActive:', error);
      handleError(error, req, res);
    }
  }
}
