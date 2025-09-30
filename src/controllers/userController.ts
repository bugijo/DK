import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';
import { CreateUserData, UpdateUserData, UserFilters, PaginationParams } from '../types';

// Criar novo usuário
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserData = req.body;
    
    // Verificar se email já existe
    const existingUser = await UserModel.findByEmail(userData.email);
    
    if (existingUser) {
      res.status(409).json({
        error: 'Email já está em uso',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Criar novo usuário
    const newUser = await UserModel.create(userData);
    
    logger.info('Novo usuário criado:', newUser.id);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      data: newUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Obter usuário por ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await UserModel.findById(id);
    
    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Usuário encontrado',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Listar usuários com paginação e filtros
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, sort_by, sort_order, ...filters } = req.query;
    
    // Construir objeto de paginação
    const pagination: any = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    };
    
    if (sort_by) {
      pagination.sort_by = sort_by;
    }
    
    if (sort_order) {
      pagination.sort_order = sort_order;
    }

    // Construir filtros
    const userFilters: UserFilters = {};
    
    if (filters.name) {
      userFilters.name = filters.name as string;
    }
    
    if (filters.email) {
      userFilters.email = filters.email as string;
    }
    
    if (filters.role) {
      userFilters.role = filters.role as string;
    }

    const result = await UserModel.findAll(pagination, userFilters);
    
    res.status(200).json({
      message: 'Usuários listados com sucesso',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Atualizar usuário
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserData = req.body;
    
    // Verificar se usuário existe
    const existingUser = await UserModel.findById(id);
    
    if (!existingUser) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Se está atualizando email, verificar se já existe
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await UserModel.emailExists(updateData.email, id);
      
      if (emailExists) {
        res.status(409).json({
          error: 'Email já está em uso',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Atualizar usuário
    const updatedUser = await UserModel.update(id, updateData);
    
    logger.info('Usuário atualizado:', id);
    
    res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      data: updatedUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Verificar se usuário existe
    const existingUser = await UserModel.findById(id);
    
    if (!existingUser) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Não permitir que o usuário delete a si mesmo
    if (req.user && req.user.id === id) {
      res.status(400).json({
        error: 'Não é possível deletar sua própria conta',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Deletar usuário
    await UserModel.delete(id);
    
    logger.info('Usuário deletado:', id);
    
    res.status(200).json({
      message: 'Usuário deletado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar usuários por role
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    
    const users = await UserModel.findByRole(role);
    
    res.status(200).json({
      message: `Usuários com role '${role}' encontrados`,
      data: users,
      count: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar usuários por role:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Contar usuários
export const countUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ...filters } = req.query;
    
    // Construir filtros
    const userFilters: UserFilters = {};
    
    if (filters.name) {
      userFilters.name = filters.name as string;
    }
    
    if (filters.email) {
      userFilters.email = filters.email as string;
    }
    
    if (filters.role) {
      userFilters.role = filters.role as string;
    }

    const count = await UserModel.count(userFilters);
    
    res.status(200).json({
      message: 'Contagem de usuários realizada',
      data: { count },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao contar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar usuário por email
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Usuário encontrado',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário por email:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};