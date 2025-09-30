import { supabase } from '../config/database';
import { Logger } from '../utils/logger';

const logger = new Logger('Appointment Model');

export interface IAppointment {
  id: string;
  client_id: string;
  pet_id: string;
  vet_id: string;
  appointment_date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no-show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IAppointmentFilters {
  client_id?: string;
  pet_id?: string;
  vet_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface IAppointmentWithDetails extends IAppointment {
  client_name: string;
  pet_name: string;
  vet_name: string;
}

export class Appointment {
  // Criar novo agendamento
  static async create(appointmentData: Omit<IAppointment, 'id' | 'created_at' | 'updated_at'>): Promise<IAppointment> {
    try {
      logger.info('Criando novo agendamento', { appointmentData });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao criar agendamento:', error);
        throw new Error(`Erro ao criar agendamento: ${error.message}`);
      }
      
      logger.info('Agendamento criado com sucesso', { appointmentId: data.id });
      return data;
    } catch (error) {
      logger.error('Erro no método create:', error);
      throw error;
    }
  }

  // Buscar agendamento por ID
  static async findById(id: string): Promise<IAppointment | null> {
    try {
      logger.info('Buscando agendamento por ID', { id });
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Agendamento não encontrado', { id });
          return null;
        }
        logger.error('Erro ao buscar agendamento:', error);
        throw new Error(`Erro ao buscar agendamento: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      logger.error('Erro no método findById:', error);
      throw error;
    }
  }

  // Buscar agendamento por ID com detalhes
  static async findByIdWithDetails(id: string): Promise<IAppointmentWithDetails | null> {
    try {
      logger.info('Buscando agendamento por ID com detalhes', { id });
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!appointments_client_id_fkey(name),
          pets!appointments_pet_id_fkey(name),
          users!appointments_vet_id_fkey(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Agendamento não encontrado', { id });
          return null;
        }
        logger.error('Erro ao buscar agendamento com detalhes:', error);
        throw new Error(`Erro ao buscar agendamento: ${error.message}`);
      }
      
      return {
        ...data,
        client_name: data.clients?.name || 'N/A',
        pet_name: data.pets?.name || 'N/A',
        vet_name: data.users?.name || 'N/A'
      };
    } catch (error) {
      logger.error('Erro no método findByIdWithDetails:', error);
      throw error;
    }
  }

  // Listar agendamentos com filtros e paginação
  static async findAll(
    page: number = 1,
    limit: number = 10,
    filters: IAppointmentFilters = {}
  ): Promise<{ appointments: IAppointmentWithDetails[]; total: number; totalPages: number }> {
    try {
      logger.info('Listando agendamentos', { page, limit, filters });
      
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients!appointments_client_id_fkey(name),
          pets!appointments_pet_id_fkey(name),
          users!appointments_vet_id_fkey(name)
        `, { count: 'exact' });
      
      // Aplicar filtros
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters.pet_id) {
        query = query.eq('pet_id', filters.pet_id);
      }
      if (filters.vet_id) {
        query = query.eq('vet_id', filters.vet_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('appointment_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('appointment_date', filters.date_to);
      }
      
      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      
      // Ordenar por data do agendamento
      query = query.order('appointment_date', { ascending: true });
      
      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Erro ao listar agendamentos:', error);
        throw new Error(`Erro ao listar agendamentos: ${error.message}`);
      }
      
      const appointments = data?.map(appointment => ({
        ...appointment,
        client_name: appointment.clients?.name || 'N/A',
        pet_name: appointment.pets?.name || 'N/A',
        vet_name: appointment.users?.name || 'N/A'
      })) || [];
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      logger.info('Agendamentos listados com sucesso', { total, page, totalPages });
      
      return {
        appointments,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Erro no método findAll:', error);
      throw error;
    }
  }

  // Atualizar agendamento
  static async update(id: string, updateData: Partial<Omit<IAppointment, 'id' | 'created_at' | 'updated_at'>>): Promise<IAppointment> {
    try {
      logger.info('Atualizando agendamento', { id, updateData });
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao atualizar agendamento:', error);
        throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
      }
      
      logger.info('Agendamento atualizado com sucesso', { id });
      return data;
    } catch (error) {
      logger.error('Erro no método update:', error);
      throw error;
    }
  }

  // Deletar agendamento
  static async delete(id: string): Promise<void> {
    try {
      logger.info('Deletando agendamento', { id });
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Erro ao deletar agendamento:', error);
        throw new Error(`Erro ao deletar agendamento: ${error.message}`);
      }
      
      logger.info('Agendamento deletado com sucesso', { id });
    } catch (error) {
      logger.error('Erro no método delete:', error);
      throw error;
    }
  }

  // Atualizar status do agendamento
  static async updateStatus(id: string, status: IAppointment['status']): Promise<IAppointment> {
    try {
      logger.info('Atualizando status do agendamento', { id, status });
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao atualizar status do agendamento:', error);
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }
      
      logger.info('Status do agendamento atualizado com sucesso', { id, status });
      return data;
    } catch (error) {
      logger.error('Erro no método updateStatus:', error);
      throw error;
    }
  }

  // Buscar agendamentos por período
  static async findByDateRange(startDate: string, endDate: string): Promise<IAppointmentWithDetails[]> {
    try {
      logger.info('Buscando agendamentos por período', { startDate, endDate });
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!appointments_client_id_fkey(name),
          pets!appointments_pet_id_fkey(name),
          users!appointments_vet_id_fkey(name)
        `)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true });
      
      if (error) {
        logger.error('Erro ao buscar agendamentos por período:', error);
        throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      }
      
      const appointments = data?.map(appointment => ({
        ...appointment,
        client_name: appointment.clients?.name || 'N/A',
        pet_name: appointment.pets?.name || 'N/A',
        vet_name: appointment.users?.name || 'N/A'
      })) || [];
      
      logger.info('Agendamentos por período encontrados', { count: appointments.length });
      return appointments;
    } catch (error) {
      logger.error('Erro no método findByDateRange:', error);
      throw error;
    }
  }

  // Buscar agendamentos do veterinário por data
  static async findByVetAndDate(vetId: string, date: string): Promise<IAppointmentWithDetails[]> {
    try {
      logger.info('Buscando agendamentos do veterinário por data', { vetId, date });
      
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!appointments_client_id_fkey(name),
          pets!appointments_pet_id_fkey(name),
          users!appointments_vet_id_fkey(name)
        `)
        .eq('vet_id', vetId)
        .gte('appointment_date', startOfDay)
        .lte('appointment_date', endOfDay)
        .order('appointment_date', { ascending: true });
      
      if (error) {
        logger.error('Erro ao buscar agendamentos do veterinário:', error);
        throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
      }
      
      const appointments = data?.map(appointment => ({
        ...appointment,
        client_name: appointment.clients?.name || 'N/A',
        pet_name: appointment.pets?.name || 'N/A',
        vet_name: appointment.users?.name || 'N/A'
      })) || [];
      
      logger.info('Agendamentos do veterinário encontrados', { count: appointments.length });
      return appointments;
    } catch (error) {
      logger.error('Erro no método findByVetAndDate:', error);
      throw error;
    }
  }
}
