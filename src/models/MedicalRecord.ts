import { supabase } from '../config/database';
import { Logger } from '../utils/logger';

const logger = new Logger('MedicalRecord Model');

export interface IMedicalRecord {
  id: string;
  appointment_id: string;
  anamnesis: string;
  diagnosis: string;
  treatment: string;
  observations?: string;
  created_at: string;
  updated_at: string;
}

export interface IMedicalRecordFilters {
  pet_id?: string;
  client_id?: string;
  vet_id?: string;
  date_from?: string;
  date_to?: string;
  diagnosis?: string;
}

export interface IMedicalRecordWithDetails extends IMedicalRecord {
  appointment_date: string;
  client_name: string;
  pet_name: string;
  vet_name: string;
}

export class MedicalRecord {
  // Criar novo prontuário médico
  static async create(recordData: Omit<IMedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<IMedicalRecord> {
    try {
      logger.info('Criando novo prontuário médico', { recordData });
      
      const { data, error } = await supabase
        .from('medical_records')
        .insert([recordData])
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao criar prontuário médico:', error);
        throw new Error(`Erro ao criar prontuário médico: ${error.message}`);
      }
      
      logger.info('Prontuário médico criado com sucesso', { recordId: data.id });
      return data;
    } catch (error) {
      logger.error('Erro no método create:', error);
      throw error;
    }
  }

  // Buscar prontuário médico por ID
  static async findById(id: string): Promise<IMedicalRecord | null> {
    try {
      logger.info('Buscando prontuário médico por ID', { id });
      
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Prontuário médico não encontrado', { id });
          return null;
        }
        logger.error('Erro ao buscar prontuário médico:', error);
        throw new Error(`Erro ao buscar prontuário médico: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      logger.error('Erro no método findById:', error);
      throw error;
    }
  }

  // Buscar prontuário médico por ID com detalhes
  static async findByIdWithDetails(id: string): Promise<IMedicalRecordWithDetails | null> {
    try {
      logger.info('Buscando prontuário médico por ID com detalhes', { id });
      
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          appointments!medical_records_appointment_id_fkey(
            appointment_date,
            clients!appointments_client_id_fkey(name),
            pets!appointments_pet_id_fkey(name),
            users!appointments_vet_id_fkey(name)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Prontuário médico não encontrado', { id });
          return null;
        }
        logger.error('Erro ao buscar prontuário médico com detalhes:', error);
        throw new Error(`Erro ao buscar prontuário médico: ${error.message}`);
      }
      
      return {
        ...data,
        appointment_date: data.appointments?.appointment_date || '',
        client_name: data.appointments?.clients?.name || 'N/A',
        pet_name: data.appointments?.pets?.name || 'N/A',
        vet_name: data.appointments?.users?.name || 'N/A'
      };
    } catch (error) {
      logger.error('Erro no método findByIdWithDetails:', error);
      throw error;
    }
  }

  // Buscar prontuário médico por ID do agendamento
  static async findByAppointmentId(appointmentId: string): Promise<IMedicalRecord | null> {
    try {
      logger.info('Buscando prontuário médico por ID do agendamento', { appointmentId });
      
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Prontuário médico não encontrado para o agendamento', { appointmentId });
          return null;
        }
        logger.error('Erro ao buscar prontuário médico por agendamento:', error);
        throw new Error(`Erro ao buscar prontuário médico: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      logger.error('Erro no método findByAppointmentId:', error);
      throw error;
    }
  }

  // Listar prontuários médicos com filtros e paginação
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: IMedicalRecordFilters = {}
  ): Promise<{ records: IMedicalRecordWithDetails[]; total: number; totalPages: number }> {
    try {
      logger.info('Listando prontuários médicos', { page, limit, filters });
      
      let query = supabase
        .from('medical_records')
        .select(`
          *,
          appointments!medical_records_appointment_id_fkey(
            appointment_date,
            client_id,
            pet_id,
            vet_id,
            clients!appointments_client_id_fkey(name),
            pets!appointments_pet_id_fkey(name),
            users!appointments_vet_id_fkey(name)
          )
        `, { count: 'exact' });
      
      // Aplicar filtros
      if (filters.pet_id) {
        query = query.eq('appointments.pet_id', filters.pet_id);
      }
      if (filters.client_id) {
        query = query.eq('appointments.client_id', filters.client_id);
      }
      if (filters.vet_id) {
        query = query.eq('appointments.vet_id', filters.vet_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.diagnosis) {
        query = query.ilike('diagnosis', `%${filters.diagnosis}%`);
      }
      
      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      // Ordenar por data de criação (mais recente primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Erro ao listar prontuários médicos:', error);
        throw new Error(`Erro ao listar prontuários médicos: ${error.message}`);
      }
      
      const records = data?.map(record => ({
        ...record,
        appointment_date: record.appointments?.appointment_date || '',
        client_name: record.appointments?.clients?.name || 'N/A',
        pet_name: record.appointments?.pets?.name || 'N/A',
        vet_name: record.appointments?.users?.name || 'N/A'
      })) || [];
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      logger.info('Prontuários médicos listados com sucesso', { total, page, totalPages });
      
      return {
        records,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Erro no método findAll:', error);
      throw error;
    }
  }

  // Buscar prontuários médicos por pet
  static async findByPetId(
    petId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ records: IMedicalRecordWithDetails[]; total: number; totalPages: number }> {
    try {
      logger.info('Buscando prontuários médicos por pet', { petId, page, limit });
      
      let query = supabase
        .from('medical_records')
        .select(`
          *,
          appointments!medical_records_appointment_id_fkey(
            appointment_date,
            clients!appointments_client_id_fkey(name),
            pets!appointments_pet_id_fkey(name),
            users!appointments_vet_id_fkey(name)
          )
        `, { count: 'exact' })
        .eq('appointments.pet_id', petId);
      
      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      // Ordenar por data de criação (mais recente primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Erro ao buscar prontuários médicos por pet:', error);
        throw new Error(`Erro ao buscar prontuários médicos: ${error.message}`);
      }
      
      const records = data?.map(record => ({
        ...record,
        appointment_date: record.appointments?.appointment_date || '',
        client_name: record.appointments?.clients?.name || 'N/A',
        pet_name: record.appointments?.pets?.name || 'N/A',
        vet_name: record.appointments?.users?.name || 'N/A'
      })) || [];
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      logger.info('Prontuários médicos por pet encontrados', { total, page, totalPages });
      
      return {
        records,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Erro no método findByPetId:', error);
      throw error;
    }
  }

  // Buscar prontuários médicos por cliente
  static async findByClientId(
    clientId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ records: IMedicalRecordWithDetails[]; total: number; totalPages: number }> {
    try {
      logger.info('Buscando prontuários médicos por cliente', { clientId, page, limit });
      
      let query = supabase
        .from('medical_records')
        .select(`
          *,
          appointments!medical_records_appointment_id_fkey(
            appointment_date,
            clients!appointments_client_id_fkey(name),
            pets!appointments_pet_id_fkey(name),
            users!appointments_vet_id_fkey(name)
          )
        `, { count: 'exact' })
        .eq('appointments.client_id', clientId);
      
      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      // Ordenar por data de criação (mais recente primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Erro ao buscar prontuários médicos por cliente:', error);
        throw new Error(`Erro ao buscar prontuários médicos: ${error.message}`);
      }
      
      const records = data?.map(record => ({
        ...record,
        appointment_date: record.appointments?.appointment_date || '',
        client_name: record.appointments?.clients?.name || 'N/A',
        pet_name: record.appointments?.pets?.name || 'N/A',
        vet_name: record.appointments?.users?.name || 'N/A'
      })) || [];
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      logger.info('Prontuários médicos por cliente encontrados', { total, page, totalPages });
      
      return {
        records,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Erro no método findByClientId:', error);
      throw error;
    }
  }

  // Buscar prontuários médicos por veterinário
  static async findByVetId(
    vetId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ records: IMedicalRecordWithDetails[]; total: number; totalPages: number }> {
    try {
      logger.info('Buscando prontuários médicos por veterinário', { vetId, page, limit });
      
      let query = supabase
        .from('medical_records')
        .select(`
          *,
          appointments!medical_records_appointment_id_fkey(
            appointment_date,
            clients!appointments_client_id_fkey(name),
            pets!appointments_pet_id_fkey(name),
            users!appointments_vet_id_fkey(name)
          )
        `, { count: 'exact' })
        .eq('appointments.vet_id', vetId);
      
      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      // Ordenar por data de criação (mais recente primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Erro ao buscar prontuários médicos por veterinário:', error);
        throw new Error(`Erro ao buscar prontuários médicos: ${error.message}`);
      }
      
      const records = data?.map(record => ({
        ...record,
        appointment_date: record.appointments?.appointment_date || '',
        client_name: record.appointments?.clients?.name || 'N/A',
        pet_name: record.appointments?.pets?.name || 'N/A',
        vet_name: record.appointments?.users?.name || 'N/A'
      })) || [];
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      logger.info('Prontuários médicos por veterinário encontrados', { total, page, totalPages });
      
      return {
        records,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Erro no método findByVetId:', error);
      throw error;
    }
  }

  // Atualizar prontuário médico
  static async update(id: string, updateData: Partial<Omit<IMedicalRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<IMedicalRecord> {
    try {
      logger.info('Atualizando prontuário médico', { id, updateData });
      
      const { data, error } = await supabase
        .from('medical_records')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao atualizar prontuário médico:', error);
        throw new Error(`Erro ao atualizar prontuário médico: ${error.message}`);
      }
      
      logger.info('Prontuário médico atualizado com sucesso', { id });
      return data;
    } catch (error) {
      logger.error('Erro no método update:', error);
      throw error;
    }
  }

  // Deletar prontuário médico
  static async delete(id: string): Promise<void> {
    try {
      logger.info('Deletando prontuário médico', { id });
      
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Erro ao deletar prontuário médico:', error);
        throw new Error(`Erro ao deletar prontuário médico: ${error.message}`);
      }
      
      logger.info('Prontuário médico deletado com sucesso', { id });
    } catch (error) {
      logger.error('Erro no método delete:', error);
      throw error;
    }
  }
}
