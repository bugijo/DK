import { Request, Response } from 'express';
import { Supplier } from '../models/Supplier';
import { Logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

const logger = new Logger('SupplierController');

// Criar novo fornecedor
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Criando novo fornecedor:', req.body);
    
    const { name, cnpj, email, phone } = req.body;
    
    // Verificar se já existe fornecedor com o mesmo CNPJ
    const existingSupplier = await Supplier.findByCnpj(cnpj);
    if (existingSupplier) {
      res.status(400).json({
        success: false,
        message: 'Já existe um fornecedor cadastrado com este CNPJ',
        error: 'CNPJ_ALREADY_EXISTS'
      });
      return;
    }
    
    const supplier = await Supplier.create({
      name,
      cnpj,
      email,
      phone
    });
    
    logger.info('Fornecedor criado com sucesso:', supplier.id);
    
    res.status(201).json({
      success: true,
      message: 'Fornecedor criado com sucesso',
      data: supplier
    });
  } catch (error) {
    logger.error('Erro ao criar fornecedor:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar fornecedor por ID
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Buscando fornecedor por ID:', id);
    
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
        error: 'SUPPLIER_NOT_FOUND'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Fornecedor encontrado',
      data: supplier
    });
  } catch (error) {
    logger.error('Erro ao buscar fornecedor por ID:', error);
    handleError(error as Error, req, res);
  }
};

// Buscar fornecedor por CNPJ
export const getSupplierByCnpj = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cnpj } = req.params;
    
    logger.info('Buscando fornecedor por CNPJ:', cnpj);
    
    const supplier = await Supplier.findByCnpj(cnpj);
    
    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
        error: 'SUPPLIER_NOT_FOUND'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Fornecedor encontrado',
      data: supplier
    });
  } catch (error) {
    logger.error('Erro ao buscar fornecedor por CNPJ:', error);
    handleError(error as Error, req, res);
  }
};

// Listar fornecedores com paginação e filtros
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { name, cnpj, email } = req.query;
    
    logger.info('Listando fornecedores:', { page, limit, filters: { name, cnpj, email } });
    
    const filters: any = {};
    if (name) filters.name = name as string;
    if (cnpj) filters.cnpj = cnpj as string;
    if (email) filters.email = email as string;
    
    const result = await Supplier.findAll(page, limit, filters);
    
    res.status(200).json({
      success: true,
      message: 'Fornecedores listados com sucesso',
      data: result.suppliers,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar fornecedores:', error);
    handleError(error as Error, req, res);
  }
};

// Atualizar fornecedor
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.info('Atualizando fornecedor:', { id, updateData });
    
    // Verificar se o fornecedor existe
    const existingSupplier = await Supplier.findById(id);
    if (!existingSupplier) {
      res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
        error: 'SUPPLIER_NOT_FOUND'
      });
      return;
    }
    
    // Se está atualizando o CNPJ, verificar se não existe outro fornecedor com o mesmo CNPJ
    if (updateData.cnpj && updateData.cnpj !== existingSupplier.cnpj) {
      const supplierWithSameCnpj = await Supplier.findByCnpj(updateData.cnpj);
      if (supplierWithSameCnpj) {
        res.status(400).json({
          success: false,
          message: 'Já existe um fornecedor cadastrado com este CNPJ',
          error: 'CNPJ_ALREADY_EXISTS'
        });
        return;
      }
    }
    
    const supplier = await Supplier.update(id, updateData);
    
    logger.info('Fornecedor atualizado com sucesso:', supplier.id);
    
    res.status(200).json({
      success: true,
      message: 'Fornecedor atualizado com sucesso',
      data: supplier
    });
  } catch (error) {
    logger.error('Erro ao atualizar fornecedor:', error);
    handleError(error as Error, req, res);
  }
};

// Deletar fornecedor
export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('Deletando fornecedor:', id);
    
    // Verificar se o fornecedor existe
    const existingSupplier = await Supplier.findById(id);
    if (!existingSupplier) {
      res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
        error: 'SUPPLIER_NOT_FOUND'
      });
      return;
    }
    
    await Supplier.delete(id);
    
    logger.info('Fornecedor deletado com sucesso:', id);
    
    res.status(200).json({
      success: true,
      message: 'Fornecedor deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar fornecedor:', error);
    handleError(error as Error, req, res);
  }
};
