import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth';
import { logRequest } from '../middleware/logger';
import {
  validateAppointmentCreation,
  validateAppointmentUpdate,
  validateAppointmentStatusUpdate,
  validateAppointmentFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(logRequest);

// Rotas para agendamentos

// POST /api/appointments - Criar novo agendamento
router.post('/', validateAppointmentCreation, AppointmentController.create);

// GET /api/appointments - Listar agendamentos com filtros e paginação
router.get('/', validatePagination, validateAppointmentFilters, AppointmentController.findAll);

// GET /api/appointments/period - Buscar agendamentos por período
router.get('/period', AppointmentController.findByDateRange);

// GET /api/appointments/vet - Buscar agendamentos do veterinário por data
router.get('/vet', AppointmentController.findByVetAndDate);

// GET /api/appointments/:id - Buscar agendamento por ID
router.get('/:id', validateUUID, AppointmentController.findById);

// PUT /api/appointments/:id - Atualizar agendamento
router.put('/:id', validateUUID, validateAppointmentUpdate, AppointmentController.update);

// DELETE /api/appointments/:id - Deletar agendamento
router.delete('/:id', validateUUID, AppointmentController.delete);

// PATCH /api/appointments/:id/confirm - Confirmar agendamento
router.patch('/:id/confirm', validateUUID, AppointmentController.confirm);

// PATCH /api/appointments/:id/complete - Completar agendamento
router.patch('/:id/complete', validateUUID, AppointmentController.complete);

// PATCH /api/appointments/:id/cancel - Cancelar agendamento
router.patch('/:id/cancel', validateUUID, AppointmentController.cancel);

// PATCH /api/appointments/:id/no-show - Marcar como não compareceu
router.patch('/:id/no-show', validateUUID, AppointmentController.noShow);

export default router;
