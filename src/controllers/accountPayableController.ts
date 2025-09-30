import { Request, Response } from 'express';
import { AccountPayable } from '../models/AccountPayable';
import { Supplier } from '../models/Supplier';
import { Logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

const logger = new Logger('AccountPayableController');

// Criar nova conta a pagar
export const createAccountPayable = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Criando nova conta a pagar:', req.body);
    
    const { description, value, due_date, supplier_id } = req.body;
    
    // Verificar se o fornecedor existe
    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      res.status(400).json({
        success: false,
        message: 'Fornecedor não encontrado',
        error: 'SUPPLIER_NOT_FOUND'
      });
      return;
    }
    
    const account = await AccountPayable.create({
      description,
      value,
      due_date,
      status: 'pending',
      supplier_id
    });
    
    logger.info('Conta a pagar criada com sucesso:', account.id);
    
    res.status(201).json({
      success: true,
      message: 'Conta a pagar criada com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao criar conta a pagar:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar conta a pagar por ID
export const getAccountPayableById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Buscando conta a pagar por ID:', id);
    
    const account = await AccountPayable.findById(id);
    
    if (!account) {
      res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Conta a pagar encontrada',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao buscar conta a pagar por ID:', error);
    handleError(error as Error, req, res);
  }
};

// Listar contas a pagar com paginação e filtros
export const getAccountsPayable = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, supplier_id, due_date_from, due_date_to } = req.query;
    
    logger.info('Listando contas a pagar:', { page, limit, filters: { status, supplier_id, due_date_from, due_date_to } });
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (supplier_id) filters.supplier_id = supplier_id as string;
    if (due_date_from) filters.due_date_from = due_date_from as string;
    if (due_date_to) filters.due_date_to = due_date_to as string;
    
    const result = await AccountPayable.findAll(page, limit, filters);
    
    res.status(200).json({
      success: true,
      message: 'Contas a pagar listadas com sucesso',
      data: result.accounts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar contas a pagar:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar contas a pagar por fornecedor
export const getAccountsPayableBySupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplier_id } = req.params;
    
    logger.info('Buscando contas a pagar por fornecedor:', supplier_id);
    
    // Verificar se o fornecedor existe
    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
        error: 'SUPPLIER_NOT_FOUND'
      });
      return;
    }
    
    const accounts = await AccountPayable.findBySupplier(supplier_id);
    
    res.status(200).json({
      success: true,
      message: 'Contas a pagar encontradas',
      data: accounts
    });
  } catch (error) {
    logger.error('Erro ao buscar contas a pagar por fornecedor:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar contas a pagar por status
export const getAccountsPayableByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    
    logger.info('Buscando contas a pagar por status:', status);
    
    const accounts = await AccountPayable.findByStatus(status as 'pending' | 'paid' | 'overdue');
    
    res.status(200).json({
      success: true,
      message: 'Contas a pagar encontradas',
      data: accounts
    });
  } catch (error) {
    logger.error('Erro ao buscar contas a pagar por status:', error);
    handleError(error as Error, req, res);
  }
};

// Atualizar conta a pagar
export const updateAccountPayable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.info('Atualizando conta a pagar:', { id, updateData });
    
    // Verificar se a conta existe
    const existingAccount = await AccountPayable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    // Se está atualizando o fornecedor, verificar se ele existe
    if (updateData.supplier_id) {
      const supplier = await Supplier.findById(updateData.supplier_id);
      if (!supplier) {
        res.status(400).json({
          success: false,
          message: 'Fornecedor não encontrado',
          error: 'SUPPLIER_NOT_FOUND'
        });
        return;
      }
    }
    
    const account = await AccountPayable.update(id, updateData);
    
    logger.info('Conta a pagar atualizada com sucesso:', account.id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a pagar atualizada com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao atualizar conta a pagar:', error);
    handleError(error as Error, req, res);
  }
};

// Marcar conta como paga
export const markAccountPayableAsPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Marcando conta a pagar como paga:', id);
    
    // Verificar se a conta existe
    const existingAccount = await AccountPayable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    const account = await AccountPayable.markAsPaid(id);
    
    logger.info('Conta a pagar marcada como paga com sucesso:', account.id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a pagar marcada como paga com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao marcar conta a pagar como paga:', error);
    handleError(error as Error, req, res);
  }
};

// Marcar conta como vencida
export const markAccountPayableAsOverdue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Marcando conta a pagar como vencida:', id);
    
    // Verificar se a conta existe
    const existingAccount = await AccountPayable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    const account = await AccountPayable.markAsOverdue(id);
    
    logger.info('Conta a pagar marcada como vencida com sucesso:', account.id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a pagar marcada como vencida com sucesso',
      data: account
    });
  } catch (error) {
    logger.error('Erro ao marcar conta a pagar como vencida:', error);
    handleError(error as Error, req, res);
  }
};

// Deletar conta a pagar
export const deleteAccountPayable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Deletando conta a pagar:', id);
    
    // Verificar se a conta existe
    const existingAccount = await AccountPayable.findById(id);
    if (!existingAccount) {
      res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada',
        error: 'ACCOUNT_NOT_FOUND'
      });
      return;
    }
    
    await AccountPayable.delete(id);
    
    logger.info('Conta a pagar deletada com sucesso:', id);
    
    res.status(200).json({
      success: true,
      message: 'Conta a pagar deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar conta a pagar:', error);
    handleError(error as Error, req, res);
  }
};
