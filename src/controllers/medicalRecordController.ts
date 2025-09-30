import { Request, Response, NextFunction } from 'express';
import { MedicalRecord, IMedicalRecord, IMedicalRecordFilters } from '../models/MedicalRecord';
import { Appointment } from '../models/Appointment';
import { Logger } from '../utils/logger';
import { handleError } from '../middleware/errorHandler';

const logger = new Logger('MedicalRecord Controller');

export class MedicalRecordController {
  // Criar novo prontuário médico
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { appointment_id, anamnesis, diagnosis, treatment, observations } = req.body;
      
      logger.info('Criando novo prontuário médico', { appointment_id });
      
      // Verificar se o agendamento existe
      const appointment = await Appointment.findById(appointment_id);
      if (!appointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }
      
      // Verificar se o agendamento está completado
      if (appointment.status !== 'completed') {
        res.status(400).json({ error: 'Apenas agendamentos completados podem ter prontuário médico' });
        return;
      }
      
      // Verificar se já existe um prontuário para este agendamento
      const existingRecord = await MedicalRecord.findByAppointmentId(appointment_id);
      if (existingRecord) {
        res.status(409).json({ error: 'Já existe um prontuário médico para este agendamento' });
        return;
      }
      
      const recordData = {
        appointment_id,
        anamnesis,
        diagnosis,
        treatment,
        observations
      };
      
      const record = await MedicalRecord.create(recordData);
      
      logger.info('Prontuário médico criado com sucesso', { recordId: record.id });
      res.status(201).json(record);
    } catch (error) {
      logger.error('Erro ao criar prontuário médico:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar prontuário médico por ID
  static async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Buscando prontuário médico por ID', { id });
      
      const record = await MedicalRecord.findByIdWithDetails(id);
      
      if (!record) {
        res.status(404).json({ error: 'Prontuário médico não encontrado' });
        return;
      }
      
      res.json(record);
    } catch (error) {
      logger.error('Erro ao buscar prontuário médico:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Listar prontuários médicos com filtros e paginação
  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: IMedicalRecordFilters = {
        pet_id: req.query.pet_id as string,
        client_id: req.query.client_id as string,
        vet_id: req.query.vet_id as string,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
        diagnosis: req.query.diagnosis as string
      };
      
      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof IMedicalRecordFilters]) {
          delete filters[key as keyof IMedicalRecordFilters];
        }
      });
      
      logger.info('Listando prontuários médicos', { page, limit, filters });
      
      const result = await MedicalRecord.findAll(page, limit, filters);
      
      res.json({
        records: result.records,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários médicos:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar prontuário médico por ID do agendamento
  static async findByAppointmentId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { appointment_id } = req.params;
      
      logger.info('Buscando prontuário médico por ID do agendamento', { appointment_id });
      
      const record = await MedicalRecord.findByAppointmentId(appointment_id);
      
      if (!record) {
        res.status(404).json({ error: 'Prontuário médico não encontrado para este agendamento' });
        return;
      }
      
      res.json(record);
    } catch (error) {
      logger.error('Erro ao buscar prontuário médico por agendamento:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar prontuários médicos por pet
  static async findByPetId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pet_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logger.info('Buscando prontuários médicos por pet', { pet_id, page, limit });
      
      const result = await MedicalRecord.findByPetId(pet_id, page, limit);
      
      res.json({
        records: result.records,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuários médicos por pet:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar histórico completo do pet
  static async findPetHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pet_id } = req.params;
      
      logger.info('Buscando histórico completo do pet', { pet_id });
      
      // Buscar todos os prontuários do pet sem paginação
      const result = await MedicalRecord.findByPetId(pet_id, 1, 1000);
      
      res.json({
        pet_id,
        total_records: result.total,
        records: result.records
      });
    } catch (error) {
      logger.error('Erro ao buscar histórico do pet:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar prontuários médicos por cliente
  static async findByClientId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { client_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logger.info('Buscando prontuários médicos por cliente', { client_id, page, limit });
      
      const result = await MedicalRecord.findByClientId(client_id, page, limit);
      
      res.json({
        records: result.records,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuários médicos por cliente:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar prontuários médicos por veterinário
  static async findByVetId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vet_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      logger.info('Buscando prontuários médicos por veterinário', { vet_id, page, limit });
      
      const result = await MedicalRecord.findByVetId(vet_id, page, limit);
      
      res.json({
        records: result.records,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuários médicos por veterinário:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Buscar estatísticas gerais
  static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Buscando estatísticas de prontuários médicos');
      
      // Buscar estatísticas básicas
      const allRecords = await MedicalRecord.findAll(1, 1000);
      
      const statistics = {
        total_records: allRecords.total,
        records_by_month: {},
        most_common_diagnoses: {},
        records_by_vet: {}
      };
      
      // Agrupar por mês
      const recordsByMonth: { [key: string]: number } = {};
      const diagnoses: { [key: string]: number } = {};
      const recordsByVet: { [key: string]: number } = {};
      
      allRecords.records.forEach(record => {
        // Por mês
        const month = new Date(record.created_at).toISOString().substring(0, 7);
        recordsByMonth[month] = (recordsByMonth[month] || 0) + 1;
        
        // Por diagnóstico
        if (record.diagnosis) {
          const diagnosisKey = record.diagnosis.toLowerCase().trim();
          diagnoses[diagnosisKey] = (diagnoses[diagnosisKey] || 0) + 1;
        }
        
        // Por veterinário
        recordsByVet[record.vet_name] = (recordsByVet[record.vet_name] || 0) + 1;
      });
      
      statistics.records_by_month = recordsByMonth;
      statistics.most_common_diagnoses = Object.entries(diagnoses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      statistics.records_by_vet = recordsByVet;
      
      res.json(statistics);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Atualizar prontuário médico
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      logger.info('Atualizando prontuário médico', { id, updateData });
      
      // Verificar se o prontuário existe
      const existingRecord = await MedicalRecord.findById(id);
      if (!existingRecord) {
        res.status(404).json({ error: 'Prontuário médico não encontrado' });
        return;
      }
      
      // Não permitir alterar o appointment_id
      if (updateData.appointment_id && updateData.appointment_id !== existingRecord.appointment_id) {
        res.status(400).json({ error: 'Não é possível alterar o agendamento vinculado ao prontuário' });
        return;
      }
      
      const record = await MedicalRecord.update(id, updateData);
      
      logger.info('Prontuário médico atualizado com sucesso', { id });
      res.json(record);
    } catch (error) {
      logger.error('Erro ao atualizar prontuário médico:', error);
      handleError(error, req, res, next);
    }
  }
  
  // Deletar prontuário médico
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Deletando prontuário médico', { id });
      
      // Verificar se o prontuário existe
      const record = await MedicalRecord.findById(id);
      if (!record) {
        res.status(404).json({ error: 'Prontuário médico não encontrado' });
        return;
      }
      
      await MedicalRecord.delete(id);
      
      logger.info('Prontuário médico deletado com sucesso', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar prontuário médico:', error);
      handleError(error, req, res, next);
    }
  }
}
