import { Router } from 'express';
import {
  createSupplier,
  getSupplierById,
  getSupplierByCnpj,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController';
import { authenticateToken } from '../middleware/auth';
import { requestLogger } from '../middleware/requestLogger';
import {
  validateSupplierCreation,
  validateSupplierUpdate,
  validateSupplierFilters,
  validatePagination,
  validateUUID
} from '../middleware/validation';

const router = Router();

// Aplicar middleware de autenticação e logging para todas as rotas
router.use(authenticateToken);
router.use(requestLogger);

// Criar novo fornecedor
router.post('/', validateSupplierCreation, createSupplier);

// Listar fornecedores com paginação e filtros
router.get('/', validatePagination, validateSupplierFilters, getSuppliers);

// Buscar fornecedor por ID
router.get('/:id', validateUUID, getSupplierById);

// Buscar fornecedor por CNPJ
router.get('/cnpj/:cnpj', getSupplierByCnpj);

// Atualizar fornecedor
router.put('/:id', validateUUID, validateSupplierUpdate, updateSupplier);

// Deletar fornecedor
router.delete('/:id', validateUUID, deleteSupplier);

export default router;
