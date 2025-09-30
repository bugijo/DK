import { Router } from 'express';
import {
  createAccountReceivable,
  getAccountReceivableById,
  getAccountsReceivable,
  getAccountsReceivableByClient,
  getAccountsReceivableByStatus,
  getAccountsReceivableByOrigin,
  updateAccountReceivable,
  markAccountReceivableAsPaid,
  markAccountReceivableAsOverdue,
  deleteAccountReceivable
} from '../controllers/accountReceivableController';
import { authenticateToken } from '../middleware/auth';
import { requestLogger } from '../middleware/requestLogger';
import {
  validateAccountReceivableCreation,
  validateAccountReceivableUpdate,
  validateAccountReceivableFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middleware de autenticação e logging para todas as rotas
router.use(authenticateToken);
router.use(requestLogger);

// Criar nova conta a receber
router.post('/', validateAccountReceivableCreation, createAccountReceivable);

// Listar contas a receber com paginação e filtros
router.get('/', validatePagination, validateAccountReceivableFilters, getAccountsReceivable);

// Buscar conta a receber por ID
router.get('/:id', validateUUID, getAccountReceivableById);

// Buscar contas a receber por cliente
router.get('/client/:client_id', validateUUID, getAccountsReceivableByClient);

// Buscar contas a receber por status
router.get('/status/:status', getAccountsReceivableByStatus);

// Buscar contas a receber por origem
router.get('/origin/:origin', getAccountsReceivableByOrigin);

// Atualizar conta a receber
router.put('/:id', validateUUID, validateAccountReceivableUpdate, updateAccountReceivable);

// Marcar conta como paga
router.patch('/:id/pay', validateUUID, markAccountReceivableAsPaid);

// Marcar conta como vencida
router.patch('/:id/overdue', validateUUID, markAccountReceivableAsOverdue);

// Deletar conta a receber
router.delete('/:id', validateUUID, deleteAccountReceivable);

export default router;
