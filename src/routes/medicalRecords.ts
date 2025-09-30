import { Router } from 'express';
import { MedicalRecordController } from '../controllers/medicalRecordController';
import { authenticateToken } from '../middleware/auth';
import { logRequest } from '../middleware/logger';
import {
  validateMedicalRecordCreation,
  validateMedicalRecordUpdate,
  validateMedicalRecordFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(logRequest);

// Rotas para prontuários médicos

// POST /api/medical-records - Criar novo prontuário médico
router.post('/', validateMedicalRecordCreation, MedicalRecordController.create);

// GET /api/medical-records - Listar prontuários médicos com filtros e paginação
router.get('/', validatePagination, validateMedicalRecordFilters, MedicalRecordController.findAll);

// GET /api/medical-records/statistics - Buscar estatísticas gerais
router.get('/statistics', MedicalRecordController.getStatistics);

// GET /api/medical-records/appointment/:appointment_id - Buscar por ID do agendamento
router.get('/appointment/:appointment_id', validateUUID, MedicalRecordController.findByAppointmentId);

// GET /api/medical-records/pet/:pet_id - Buscar prontuários por pet
router.get('/pet/:pet_id', validateUUID, validatePagination, MedicalRecordController.findByPetId);

// GET /api/medical-records/pet/:pet_id/history - Buscar histórico completo do pet
router.get('/pet/:pet_id/history', validateUUID, MedicalRecordController.findPetHistory);

// GET /api/medical-records/client/:client_id - Buscar prontuários por cliente
router.get('/client/:client_id', validateUUID, validatePagination, MedicalRecordController.findByClientId);

// GET /api/medical-records/vet/:vet_id - Buscar prontuários por veterinário
router.get('/vet/:vet_id', validateUUID, validatePagination, MedicalRecordController.findByVetId);

// GET /api/medical-records/:id - Buscar prontuário médico por ID
router.get('/:id', validateUUID, MedicalRecordController.findById);

// PUT /api/medical-records/:id - Atualizar prontuário médico
router.put('/:id', validateUUID, validateMedicalRecordUpdate, MedicalRecordController.update);

// DELETE /api/medical-records/:id - Deletar prontuário médico
router.delete('/:id', validateUUID, MedicalRecordController.delete);

export default router;
