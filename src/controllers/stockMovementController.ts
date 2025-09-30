import { Request, Response } from 'express';
import { StockMovement, IStockMovement, IStockMovementFilters } from '../models/StockMovement';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

export class StockMovementController {
  // Criar movimentação de estoque
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const movementData: Omit<IStockMovement, 'id' | 'created_at'> = {
        ...req.body,
        user_id: req.user?.id // Obtém o ID do usuário autenticado
      };

      // Verificar se o produto existe e está ativo
      const product = await Product.findById(movementData.product_id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({ error: 'Não é possível movimentar produto inativo' });
        return;
      }

      const movement = await StockMovement.create(movementData);
      
      res.status(201).json({
        message: 'Movimentação criada com sucesso',
        data: movement
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.create:', error);
      handleError(error, req, res);
    }
  }

  // Buscar movimentação por ID
  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const movement = await StockMovement.findById(id);

      if (!movement) {
        res.status(404).json({ error: 'Movimentação não encontrada' });
        return;
      }

      res.json({
        message: 'Movimentação encontrada',
        data: movement
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.findById:', error);
      handleError(error, req, res);
    }
  }

  // Buscar movimentação por ID com detalhes
  static async findByIdWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const movement = await StockMovement.findByIdWithDetails(id);

      if (!movement) {
        res.status(404).json({ error: 'Movimentação não encontrada' });
        return;
      }

      res.json({
        message: 'Movimentação encontrada',
        data: movement
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.findByIdWithDetails:', error);
      handleError(error, req, res);
    }
  }

  // Listar movimentações com filtros e paginação
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: IStockMovementFilters = {
        product_id: req.query.product_id as string,
        type: req.query.type as string,
        user_id: req.query.user_id as string,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        reason: req.query.reason as string
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof IStockMovementFilters] === undefined || filters[key as keyof IStockMovementFilters] === '') {
          delete filters[key as keyof IStockMovementFilters];
        }
      });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await StockMovement.findAll(filters, page, limit);

      res.json({
        message: 'Movimentações encontradas',
        data: result.movements,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.findAll:', error);
      handleError(error, req, res);
    }
  }

  // Buscar movimentações por produto
  static async findByProductId(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await StockMovement.findByProductId(productId, page, limit);

      res.json({
        message: 'Movimentações do produto encontradas',
        data: result.movements,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.findByProductId:', error);
      handleError(error, req, res);
    }
  }

  // Buscar movimentações por tipo
  static async findByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      
      // Validar tipo de movimentação
      const validTypes = ['entry', 'sale', 'adjustment', 'internal_use'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ error: 'Tipo de movimentação inválido' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await StockMovement.findByType(type, page, limit);

      res.json({
        message: `Movimentações do tipo '${type}' encontradas`,
        data: result.movements,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.findByType:', error);
      handleError(error, req, res);
    }
  }

  // Buscar movimentações por período
  static async findByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({ error: 'Datas de início e fim são obrigatórias' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await StockMovement.findByDateRange(
        start_date as string,
        end_date as string,
        page,
        limit
      );

      res.json({
        message: 'Movimentações do período encontradas',
        data: result.movements,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.findByDateRange:', error);
      handleError(error, req, res);
    }
  }

  // Obter resumo de movimentações
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const filters: IStockMovementFilters = {
        product_id: req.query.product_id as string,
        user_id: req.query.user_id as string,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof IStockMovementFilters] === undefined || filters[key as keyof IStockMovementFilters] === '') {
          delete filters[key as keyof IStockMovementFilters];
        }
      });

      const summary = await StockMovement.getSummary(filters);

      res.json({
        message: 'Resumo de movimentações',
        data: summary
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.getSummary:', error);
      handleError(error, req, res);
    }
  }

  // Deletar movimentação
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se a movimentação existe
      const existingMovement = await StockMovement.findById(id);
      if (!existingMovement) {
        res.status(404).json({ error: 'Movimentação não encontrada' });
        return;
      }

      await StockMovement.delete(id);

      res.json({
        message: 'Movimentação deletada com sucesso'
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.delete:', error);
      handleError(error, req, res);
    }
  }

  // Criar movimentação de uso interno
  static async createInternalUse(req: Request, res: Response): Promise<void> {
    try {
      const data = {
        ...req.body,
        user_id: req.user?.id
      };

      // Verificar se o produto existe e está ativo
      const product = await Product.findById(data.product_id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({ error: 'Não é possível movimentar produto inativo' });
        return;
      }

      const movement = await StockMovement.createInternalUse(data);
      
      res.status(201).json({
        message: 'Movimentação de uso interno criada com sucesso',
        data: movement
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.createInternalUse:', error);
      handleError(error, req, res);
    }
  }

  // Criar movimentação de venda
  static async createSale(req: Request, res: Response): Promise<void> {
    try {
      const data = {
        ...req.body,
        user_id: req.user?.id
      };

      // Verificar se o produto existe e está ativo
      const product = await Product.findById(data.product_id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({ error: 'Não é possível movimentar produto inativo' });
        return;
      }

      const movement = await StockMovement.createSale(data);
      
      res.status(201).json({
        message: 'Movimentação de venda criada com sucesso',
        data: movement
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.createSale:', error);
      handleError(error, req, res);
    }
  }

  // Criar movimentação de entrada
  static async createEntry(req: Request, res: Response): Promise<void> {
    try {
      const data = {
        ...req.body,
        user_id: req.user?.id
      };

      // Verificar se o produto existe
      const product = await Product.findById(data.product_id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      const movement = await StockMovement.createEntry(data);
      
      res.status(201).json({
        message: 'Movimentação de entrada criada com sucesso',
        data: movement
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.createEntry:', error);
      handleError(error, req, res);
    }
  }

  // Obter tipos de movimentação disponíveis
  static async getMovementTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = [
        {
          value: 'entry',
          label: 'Entrada',
          description: 'Entrada de produtos no estoque'
        },
        {
          value: 'sale',
          label: 'Venda',
          description: 'Saída por venda de produtos'
        },
        {
          value: 'adjustment',
          label: 'Ajuste',
          description: 'Ajuste de estoque (entrada ou saída)'
        },
        {
          value: 'internal_use',
          label: 'Uso Interno',
          description: 'Uso interno de produtos (ex: procedimentos)'
        }
      ];

      res.json({
        message: 'Tipos de movimentação disponíveis',
        data: types
      });
    } catch (error) {
      logger.error('Erro no StockMovementController.getMovementTypes:', error);
      handleError(error, req, res);
    }
  }
}
