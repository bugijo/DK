import { Request, Response } from 'express';
import { ClientModel } from '../models/Client';
import { logger } from '../utils/logger';
import { CreateClientData, UpdateClientData, ClientFilters, PaginationParams } from '../types';

// Criar novo cliente
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientData: CreateClientData = req.body;
    
    // Verificar se CPF já existe
    const existingClientByCpf = await ClientModel.findByCpf(clientData.cpf);
    
    if (existingClientByCpf) {
      res.status(409).json({
        error: 'CPF já está em uso',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verificar se email já existe
    const existingClientByEmail = await ClientModel.findByEmail(clientData.email);
    
    if (existingClientByEmail) {
      res.status(409).json({
        error: 'Email já está em uso',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Criar novo cliente
    const newClient = await ClientModel.create(clientData);
    
    logger.info('Novo cliente criado:', newClient.id);
    
    res.status(201).json({
      message: 'Cliente criado com sucesso',
      data: newClient,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Obter cliente por ID
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const client = await ClientModel.findById(id);
    
    if (!client) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Cliente encontrado',
      data: client,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Listar clientes com paginação e filtros
export const getClients = async (req: Request, res: Response): Promise<void> => {
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
    const clientFilters: ClientFilters = {};
    
    if (filters.name) {
      clientFilters.name = filters.name as string;
    }
    
    if (filters.email) {
      clientFilters.email = filters.email as string;
    }
    
    if (filters.cpf) {
      clientFilters.cpf = filters.cpf as string;
    }

    const result = await ClientModel.findAll(pagination, clientFilters);
    
    res.status(200).json({
      message: 'Clientes listados com sucesso',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao listar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Atualizar cliente
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateClientData = req.body;
    
    // Verificar se cliente existe
    const existingClient = await ClientModel.findById(id);
    
    if (!existingClient) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Se está atualizando CPF, verificar se já existe
    if (updateData.cpf && updateData.cpf !== existingClient.cpf) {
      const cpfExists = await ClientModel.cpfExists(updateData.cpf, id);
      
      if (cpfExists) {
        res.status(409).json({
          error: 'CPF já está em uso',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Se está atualizando email, verificar se já existe
    if (updateData.email && updateData.email !== existingClient.email) {
      const emailExists = await ClientModel.emailExists(updateData.email, id);
      
      if (emailExists) {
        res.status(409).json({
          error: 'Email já está em uso',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Atualizar cliente
    const updatedClient = await ClientModel.update(id, updateData);
    
    logger.info('Cliente atualizado:', id);
    
    res.status(200).json({
      message: 'Cliente atualizado com sucesso',
      data: updatedClient,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Deletar cliente
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Verificar se cliente existe
    const existingClient = await ClientModel.findById(id);
    
    if (!existingClient) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // TODO: Verificar se cliente tem pets associados antes de deletar
    // const pets = await PetModel.findByClientId(id);
    // if (pets.length > 0) {
    //   res.status(400).json({
    //     error: 'Não é possível deletar cliente com pets associados',
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    // Deletar cliente
    await ClientModel.delete(id);
    
    logger.info('Cliente deletado:', id);
    
    res.status(200).json({
      message: 'Cliente deletado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar cliente por CPF
export const getClientByCpf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpf } = req.params;
    
    const client = await ClientModel.findByCpf(cpf);
    
    if (!client) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Cliente encontrado',
      data: client,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar cliente por CPF:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar cliente por email
export const getClientByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    const client = await ClientModel.findByEmail(email);
    
    if (!client) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Cliente encontrado',
      data: client,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar cliente por email:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Contar clientes
export const countClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ...filters } = req.query;
    
    // Construir filtros
    const clientFilters: ClientFilters = {};
    
    if (filters.name) {
      clientFilters.name = filters.name as string;
    }
    
    if (filters.email) {
      clientFilters.email = filters.email as string;
    }
    
    if (filters.cpf) {
      clientFilters.cpf = filters.cpf as string;
    }

    const count = await ClientModel.count(clientFilters);
    
    res.status(200).json({
      message: 'Contagem de clientes realizada',
      data: { count },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao contar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};