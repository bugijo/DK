import { Router } from 'express';
import {
  createAccountPayable,
  getAccountPayableById,
  getAccountsPayable,
  getAccountsPayableBySupplier,
  getAccountsPayableByStatus,
  updateAccountPayable,
  markAccountPayableAsPaid,
  markAccountPayableAsOverdue,
  deleteAccountPayable
} from '../controllers/accountPayableController';
import { authenticateToken } from '../middleware/auth';
import { requestLogger } from '../middleware/requestLogger';
import {
  validateAccountPayableCreation,
  validateAccountPayableUpdate,
  validateAccountPayableFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middleware de autenticação e logging para todas as rotas
router.use(authenticateToken);
router.use(requestLogger);

// Criar nova conta a pagar
router.post('/', validateAccountPayableCreation, createAccountPayable);

// Listar contas a pagar com paginação e filtros
router.get('/', validatePagination, validateAccountPayableFilters, getAccountsPayable);

// Buscar conta a pagar por ID
router.get('/:id', validateUUID, getAccountPayableById);

// Buscar contas a pagar por fornecedor
router.get('/supplier/:supplier_id', validateUUID, getAccountsPayableBySupplier);

// Buscar contas a pagar por status
router.get('/status/:status', getAccountsPayableByStatus);

// Atualizar conta a pagar
router.put('/:id', validateUUID, validateAccountPayableUpdate, updateAccountPayable);

// Marcar conta como paga
router.patch('/:id/pay', validateUUID, markAccountPayableAsPaid);

// Marcar conta como vencida
router.patch('/:id/overdue', validateUUID, markAccountPayableAsOverdue);

// Deletar conta a pagar
router.delete('/:id', validateUUID, deleteAccountPayable);

export default router;
