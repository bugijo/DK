import { Request, Response } from 'express';
import { PetModel } from '../models/Pet';
import { ClientModel } from '../models/Client';
import { logger } from '../utils/logger';
import { CreatePetData, UpdatePetData, PetFilters, PaginationParams } from '../types';

// Criar novo pet
export const createPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const petData: CreatePetData = req.body;
    
    // Verificar se cliente existe
    const client = await ClientModel.findById(petData.client_id);
    
    if (!client) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verificar se microchip já existe (se fornecido)
    if (petData.microchip) {
      const existingPet = await PetModel.findByMicrochip(petData.microchip);
      
      if (existingPet) {
        res.status(409).json({
          error: 'Microchip já está em uso',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Criar novo pet
    const newPet = await PetModel.create(petData);
    
    logger.info('Novo pet criado:', newPet.id);
    
    res.status(201).json({
      message: 'Pet criado com sucesso',
      data: newPet,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao criar pet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Obter pet por ID
export const getPetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const includeClient = req.query.include_client === 'true';
    
    const pet = await PetModel.findById(id, includeClient);
    
    if (!pet) {
      res.status(404).json({
        error: 'Pet não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Pet encontrado',
      data: pet,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar pet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Listar pets com paginação e filtros
export const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, sort_by, sort_order, include_client, ...filters } = req.query;
    
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
    const petFilters: PetFilters = {};
    
    if (filters.name) {
      petFilters.name = filters.name as string;
    }
    
    if (filters.species) {
      petFilters.species = filters.species as string;
    }
    
    if (filters.client_id) {
      petFilters.client_id = filters.client_id as string;
    }

    const includeClientData = include_client === 'true';
    const result = await PetModel.findAll(pagination, petFilters, includeClientData);
    
    res.status(200).json({
      message: 'Pets listados com sucesso',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao listar pets:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Atualizar pet
export const updatePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdatePetData = req.body;
    
    // Verificar se pet existe
    const existingPet = await PetModel.findById(id, false);
    
    if (!existingPet) {
      res.status(404).json({
        error: 'Pet não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Se está atualizando client_id, verificar se cliente existe
    if (updateData.client_id && updateData.client_id !== existingPet.client_id) {
      const client = await ClientModel.findById(updateData.client_id);
      
      if (!client) {
        res.status(404).json({
          error: 'Cliente não encontrado',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Se está atualizando microchip, verificar se já existe
    if (updateData.microchip && updateData.microchip !== existingPet.microchip) {
      const microchipExists = await PetModel.microchipExists(updateData.microchip, id);
      
      if (microchipExists) {
        res.status(409).json({
          error: 'Microchip já está em uso',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // Atualizar pet
    const updatedPet = await PetModel.update(id, updateData);
    
    logger.info('Pet atualizado:', id);
    
    res.status(200).json({
      message: 'Pet atualizado com sucesso',
      data: updatedPet,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao atualizar pet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Deletar pet
export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Verificar se pet existe
    const existingPet = await PetModel.findById(id, false);
    
    if (!existingPet) {
      res.status(404).json({
        error: 'Pet não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // TODO: Verificar se pet tem consultas/histórico antes de deletar
    // const appointments = await AppointmentModel.findByPetId(id);
    // if (appointments.length > 0) {
    //   res.status(400).json({
    //     error: 'Não é possível deletar pet com consultas associadas',
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    // Deletar pet
    await PetModel.delete(id);
    
    logger.info('Pet deletado:', id);
    
    res.status(200).json({
      message: 'Pet deletado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao deletar pet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar pet por microchip
export const getPetByMicrochip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { microchip } = req.params;
    
    const pet = await PetModel.findByMicrochip(microchip);
    
    if (!pet) {
      res.status(404).json({
        error: 'Pet não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Pet encontrado',
      data: pet,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar pet por microchip:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar pets por cliente
export const getPetsByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    
    // Verificar se cliente existe
    const client = await ClientModel.findById(clientId);
    
    if (!client) {
      res.status(404).json({
        error: 'Cliente não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const pets = await PetModel.findByClientId(clientId);
    
    res.status(200).json({
      message: 'Pets do cliente encontrados',
      data: pets,
      count: pets.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar pets por cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Buscar pets por espécie
export const getPetsBySpecies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { species } = req.params;
    
    const pets = await PetModel.findBySpecies(species);
    
    res.status(200).json({
      message: `Pets da espécie '${species}' encontrados`,
      data: pets,
      count: pets.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao buscar pets por espécie:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Contar pets
export const countPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ...filters } = req.query;
    
    // Construir filtros
    const petFilters: PetFilters = {};
    
    if (filters.name) {
      petFilters.name = filters.name as string;
    }
    
    if (filters.species) {
      petFilters.species = filters.species as string;
    }
    
    if (filters.client_id) {
      petFilters.client_id = filters.client_id as string;
    }

    const count = await PetModel.count(petFilters);
    
    res.status(200).json({
      message: 'Contagem de pets realizada',
      data: { count },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao contar pets:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};