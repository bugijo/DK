import { Request, Response, NextFunction } from 'express';
import { Appointment, IAppointment, IAppointmentFilters } from '../models/Appointment';
import { Client } from '../models/Client';
import { Pet } from '../models/Pet';
import { User } from '../models/User';
import { Logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

const logger = new Logger('Appointment Controller');

export class AppointmentController {
  // Criar novo agendamento
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { client_id, pet_id, vet_id, appointment_date, status = 'scheduled', notes } = req.body;
      
      logger.info('Criando novo agendamento', { client_id, pet_id, vet_id, appointment_date });
      
      // Verificar se o cliente existe
      const client = await Client.findById(client_id);
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
      
      // Verificar se o pet existe e pertence ao cliente
      const pet = await Pet.findById(pet_id);
      if (!pet) {
        res.status(404).json({ error: 'Pet não encontrado' });
        return;
      }
      
      if (pet.client_id !== client_id) {
        res.status(400).json({ error: 'Pet não pertence ao cliente informado' });
        return;
      }
      
      // Verificar se o veterinário existe e tem a role correta
      const vet = await User.findById(vet_id);
      if (!vet) {
        res.status(404).json({ error: 'Veterinário não encontrado' });
        return;
      }
      
      if (vet.role !== 'veterinarian') {
        res.status(400).json({ error: 'Usuário informado não é um veterinário' });
        return;
      }
      
      // Verificar conflito de horário
      const appointmentDateTime = new Date(appointment_date);
      const startTime = new Date(appointmentDateTime.getTime() - 30 * 60000); // 30 min antes
      const endTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // 30 min depois
      
      const conflictingAppointments = await Appointment.findByDateRange(
        startTime.toISOString(),
        endTime.toISOString()
      );
      
      const hasConflict = conflictingAppointments.some(
        appointment => appointment.vet_id === vet_id && 
        ['scheduled', 'confirmed'].includes(appointment.status)
      );
      
      if (hasConflict) {
        res.status(409).json({ error: 'Veterinário já possui agendamento neste horário' });
        return;
      }
      
      const appointmentData = {
        client_id,
        pet_id,
        vet_id,
        appointment_date,
        status,
        notes
      };
      
      const appointment = await Appointment.create(appointmentData);
      
      logger.info('Agendamento criado com sucesso', { appointmentId: appointment.id });
      res.status(201).json(appointment);
    } catch (error) {
      logger.error('Erro ao criar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar agendamento por ID
  static async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Buscando agendamento por ID', { id });
      
      const appointment = await Appointment.findByIdWithDetails(id);
      
      if (!appointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      res.json(appointment);
    } catch (error) {
      logger.error('Erro ao buscar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Listar agendamentos com filtros e paginação
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: IAppointmentFilters = {
        client_id: req.query.client_id as string,
        pet_id: req.query.pet_id as string,
        vet_id: req.query.vet_id as string,
        status: req.query.status as string,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string
      };
      
      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof IAppointmentFilters]) {
          delete filters[key as keyof IAppointmentFilters];
        }
      });
      
      logger.info('Listando agendamentos', { page, limit, filters });
      
      const result = await Appointment.findAll(page, limit, filters);
      
      res.json({
        appointments: result.appointments,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro ao listar agendamentos:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Atualizar agendamento
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      logger.info('Atualizando agendamento', { id, updateData });
      
      // Verificar se o agendamento existe
      const existingAppointment = await Appointment.findById(id);
      if (!existingAppointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      // Se está atualizando o cliente, verificar se existe
      if (updateData.client_id) {
        const client = await Client.findById(updateData.client_id);
        if (!client) {
          res.status(404).json({ error: 'Cliente não encontrado' });
          return;
        }
      }
      
      // Se está atualizando o pet, verificar se existe e pertence ao cliente
      if (updateData.pet_id) {
        const pet = await Pet.findById(updateData.pet_id);
        if (!pet) {
          res.status(404).json({ error: 'Pet não encontrado' });
          return;
        }
        
        const clientId = updateData.client_id || existingAppointment.client_id;
        if (pet.client_id !== clientId) {
          res.status(400).json({ error: 'Pet não pertence ao cliente informado' });
          return;
        }
      }
      
      // Se está atualizando o veterinário, verificar se existe e tem a role correta
      if (updateData.vet_id) {
        const vet = await User.findById(updateData.vet_id);
        if (!vet) {
          res.status(404).json({ error: 'Veterinário não encontrado' });
          return;
        }
        
        if (vet.role !== 'veterinarian') {
          res.status(400).json({ error: 'Usuário informado não é um veterinário' });
          return;
        }
      }
      
      // Se está atualizando a data/hora ou veterinário, verificar conflito
      if (updateData.appointment_date || updateData.vet_id) {
        const appointmentDate = updateData.appointment_date || existingAppointment.appointment_date;
        const vetId = updateData.vet_id || existingAppointment.vet_id;
        
        const appointmentDateTime = new Date(appointmentDate);
        const startTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
        const endTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
        
        const conflictingAppointments = await Appointment.findByDateRange(
          startTime.toISOString(),
          endTime.toISOString()
        );
        
        const hasConflict = conflictingAppointments.some(
          appointment => appointment.vet_id === vetId && 
          appointment.id !== id &&
          ['scheduled', 'confirmed'].includes(appointment.status)
        );
        
        if (hasConflict) {
          res.status(409).json({ error: 'Veterinário já possui agendamento neste horário' });
          return;
        }
      }
      
      const appointment = await Appointment.update(id, updateData);
      
      logger.info('Agendamento atualizado com sucesso', { id });
      res.json(appointment);
    } catch (error) {
      logger.error('Erro ao atualizar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Deletar agendamento
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Deletando agendamento', { id });
      
      // Verificar se o agendamento existe
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      await Appointment.delete(id);
      
      logger.info('Agendamento deletado com sucesso', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar agendamentos por período
  static async findByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        res.status(400).json({ error: 'Parâmetros start_date e end_date são obrigatórios' });
        return;
      }
      
      logger.info('Buscando agendamentos por período', { start_date, end_date });
      
      const appointments = await Appointment.findByDateRange(
        start_date as string,
        end_date as string
      );
      
      res.json(appointments);
    } catch (error) {
      logger.error('Erro ao buscar agendamentos por período:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar agendamentos do veterinário por data
  static async findByVetAndDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vet_id, date } = req.query;
      
      if (!vet_id || !date) {
        res.status(400).json({ error: 'Parâmetros vet_id e date são obrigatórios' });
        return;
      }
      
      logger.info('Buscando agendamentos do veterinário por data', { vet_id, date });
      
      // Verificar se o veterinário existe
      const vet = await User.findById(vet_id as string);
      if (!vet) {
        res.status(404).json({ error: 'Veterinário não encontrado' });
        return;
      }
      
      if (vet.role !== 'veterinarian') {
        res.status(400).json({ error: 'Usuário informado não é um veterinário' });
        return;
      }
      
      const appointments = await Appointment.findByVetAndDate(
        vet_id as string,
        date as string
      );
      
      res.json(appointments);
    } catch (error) {
      logger.error('Erro ao buscar agendamentos do veterinário:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Confirmar agendamento
  static async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Confirmando agendamento', { id });
      
      // Verificar se o agendamento existe
      const existingAppointment = await Appointment.findById(id);
      if (!existingAppointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      if (existingAppointment.status !== 'scheduled') {
        res.status(400).json({ error: 'Apenas agendamentos com status "scheduled" podem ser confirmados' });
        return;
      }
      
      const appointment = await Appointment.updateStatus(id, 'confirmed');
      
      logger.info('Agendamento confirmado com sucesso', { id });
      res.json(appointment);
    } catch (error) {
      logger.error('Erro ao confirmar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Completar agendamento
  static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Completando agendamento', { id });
      
      // Verificar se o agendamento existe
      const existingAppointment = await Appointment.findById(id);
      if (!existingAppointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      if (!['scheduled', 'confirmed'].includes(existingAppointment.status)) {
        res.status(400).json({ error: 'Apenas agendamentos com status "scheduled" ou "confirmed" podem ser completados' });
        return;
      }
      
      const appointment = await Appointment.updateStatus(id, 'completed');
      
      logger.info('Agendamento completado com sucesso', { id });
      res.json(appointment);
    } catch (error) {
      logger.error('Erro ao completar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Cancelar agendamento
  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Cancelando agendamento', { id });
      
      // Verificar se o agendamento existe
      const existingAppointment = await Appointment.findById(id);
      if (!existingAppointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      if (['completed', 'canceled'].includes(existingAppointment.status)) {
        res.status(400).json({ error: 'Agendamento já foi finalizado e não pode ser cancelado' });
        return;
      }
      
      const appointment = await Appointment.updateStatus(id, 'canceled');
      
      logger.info('Agendamento cancelado com sucesso', { id });
      res.json(appointment);
    } catch (error) {
      logger.error('Erro ao cancelar agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Marcar como não compareceu
  static async noShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Marcando agendamento como não compareceu', { id });
      
      // Verificar se o agendamento existe
      const existingAppointment = await Appointment.findById(id);
      if (!existingAppointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      if (!['scheduled', 'confirmed'].includes(existingAppointment.status)) {
        res.status(400).json({ error: 'Apenas agendamentos com status "scheduled" ou "confirmed" podem ser marcados como não compareceu' });
        return;
      }
      
      const appointment = await Appointment.updateStatus(id, 'no-show');
      
      logger.info('Agendamento marcado como não compareceu', { id });
      res.json(appointment);
    } catch (error) {
      logger.error('Erro ao marcar agendamento como não compareceu:', error);
      handleError(error, req, res, next);
    }
  }
}
