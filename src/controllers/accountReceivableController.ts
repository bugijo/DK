import { Request, Response } from 'express';
import { AccountReceivable } from '../models/AccountReceivable';
import { Client } from '../models/Client';
import { Logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

const logger = new Logger('AccountReceivableController');

// Criar nova conta a receber
export const createAccountReceivable = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Criando nova conta a receber:', req.body);
    
    const { description, value, due_date, client_id, origin } = req.body;
    
    // Verificar se o cliente existe
    const client = await Client.findById(client_id);
    if (!client) {
      res.status(400).json({
        success: false,
        message: 'Cliente não encontrado',
        error: 'CLIENT_NOT_FOUND'
      });
      return;
    }
    
    const account = await AccountReceivable.create({
      description,
      value,
      due_date,
      status: 'pending',
      client_id,
      origin
    });
    
    logger.info('Conta a receber criada com sucesso:', account.id);
    
    res.status(201).json({
      success: true,
      message: 'Conta a receber criada com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao criar conta a receber:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar conta a receber por ID
export const getAccountReceivableById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Buscando conta a receber por ID:', id);
    
    const account = await AccountReceivable.findById(id);
    
    if (!account) {
      res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Conta a receber encontrada',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao buscar conta a receber por ID:', error);
    handleError(error as Error, req, res);
  }
};

// Listar contas a receber com paginação e filtros
export const getAccountsReceivable = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, client_id, origin, due_date_from, due_date_to } = req.query;
    
    logger.info('Listando contas a receber:', { page, limit, filters: { status, client_id, origin, due_date_from, due_date_to } });
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (client_id) filters.client_id = client_id as string;
    if (origin) filters.origin = origin as string;
    if (due_date_from) filters.due_date_from = due_date_from as string;
    if (due_date_to) filters.due_date_to = due_date_to as string;
    
    const result = await AccountReceivable.findAll(page, limit, filters);
    
    res.status(200).json({
      success: true,
      message: 'Contas a receber listadas com sucesso',
      data: result.accounts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar contas a receber:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar contas a receber por cliente
export const getAccountsReceivableByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { client_id } = req.params;
    
    logger.info('Buscando contas a receber por cliente:', client_id);
    
    // Verificar se o cliente existe
    const client = await Client.findById(client_id);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
        error: 'CLIENT_NOT_FOUND'
      });
      return;
    }
    
    const accounts = await AccountReceivable.findByClient(client_id);
    
    res.status(200).json({
      success: true,
      message: 'Contas a receber encontradas',
      data: accounts
    });
  } catch (error) {
    logger.error('Erro ao buscar contas a receber por cliente:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar contas a receber por status
export const getAccountsReceivableByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    
    logger.info('Buscando contas a receber por status:', status);
    
    const accounts = await AccountReceivable.findByStatus(status as 'pending' | 'paid' | 'overdue');
    
    res.status(200).json({
      success: true,
      message: 'Contas a receber encontradas',
      data: accounts
    });
  } catch (error) {
    logger.error('Erro ao buscar contas a receber por status:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar contas a receber por origem
export const getAccountsReceivableByOrigin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin } = req.params;
    
    logger.info('Buscando contas a receber por origem:', origin);
    
    const accounts = await AccountReceivable.findByOrigin(origin as 'consultation' | 'product_sale' | 'service' | 'other');
    
    res.status(200).json({
      success: true,
      message: 'Contas a receber encontradas',
      data: accounts
    });
  } catch (error) {
    logger.error('Erro ao buscar contas a receber por origem:', error);
    handleError(error as Error, req, res);
  }
};

// Atualizar conta a receber
export const updateAccountReceivable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.info('Atualizando conta a receber:', { id, updateData });
    
    // Verificar se a conta existe
    const existingAccount = await AccountReceivable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    // Se está atualizando o cliente, verificar se ele existe
    if (updateData.client_id) {
      const client = await Client.findById(updateData.client_id);
      if (!client) {
        res.status(400).json({
          success: false,
          message: 'Cliente não encontrado',
          error: 'CLIENT_NOT_FOUND'
        });
        return;
      }
    }
    
    const account = await AccountReceivable.update(id, updateData);
    
    logger.info('Conta a receber atualizada com sucesso:', account.id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a receber atualizada com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao atualizar conta a receber:', error);
    handleError(error as Error, req, res);
  }
};

// Marcar conta como paga
export const markAccountReceivableAsPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Marcando conta a receber como paga:', id);
    
    // Verificar se a conta existe
    const existingAccount = await AccountReceivable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    const account = await AccountReceivable.markAsPaid(id);
    
    logger.info('Conta a receber marcada como paga com sucesso:', account.id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a receber marcada como paga com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao marcar conta a receber como paga:', error);
    handleError(error as Error, req, res);
  }
};

// Marcar conta como vencida
export const markAccountReceivableAsOverdue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Marcando conta a receber como vencida:', id);
    
    // Verificar se a conta existe
    const existingAccount = await AccountReceivable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    const account = await AccountReceivable.markAsOverdue(id);
    
    logger.info('Conta a receber marcada como vencida com sucesso:', account.id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a receber marcada como vencida com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao marcar conta a receber como vencida:', error);
    handleError(error as Error, req, res);
  }
};

// Deletar conta a receber
export const deleteAccountReceivable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Deletando conta a receber:', id);
    
    // Verificar se a conta existe
    const existingAccount = await AccountReceivable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    await AccountReceivable.delete(id);
    
    logger.info('Conta a receber deletada com sucesso:', id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a receber deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar conta a receber:', error);
    handleError(error as Error, req, res);
  }
};
