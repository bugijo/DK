import { Router } from 'express';
import {
  createClient,
  getClientById,
  getClients,
  updateClient,
  deleteClient,
  getClientByCpf,
  getClientByEmail,
  countClients,
} from '../controllers/clientController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createClientSchema, updateClientSchema } from '../middleware/validation';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @route POST /api/clients
 * @desc Criar novo cliente
 * @access Private (Admin, Vet, Assistant)
 */
router.post('/', 
  requireRole(['admin', 'vet', 'assistant']), 
  validateRequest(createClientSchema), 
  createClient
);

/**
 * @route GET /api/clients
 * @desc Listar clientes com paginação e filtros
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/', requireRole(['admin', 'vet', 'assistant']), getClients);

/**
 * @route GET /api/clients/count
 * @desc Contar clientes
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/count', requireRole(['admin', 'vet', 'assistant']), countClients);

/**
 * @route GET /api/clients/cpf/:cpf
 * @desc Buscar cliente por CPF
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/cpf/:cpf', requireRole(['admin', 'vet', 'assistant']), getClientByCpf);

/**
 * @route GET /api/clients/email/:email
 * @desc Buscar cliente por email
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/email/:email', requireRole(['admin', 'vet', 'assistant']), getClientByEmail);

/**
 * @route GET /api/clients/:id
 * @desc Obter cliente por ID
 * @access Private (Admin, Vet, Assistant)
 */
router.get('/:id', requireRole(['admin', 'vet', 'assistant']), getClientById);

/**
 * @route PUT /api/clients/:id
 * @desc Atualizar cliente
 * @access Private (Admin, Vet, Assistant)
 */
router.put('/:id', 
  requireRole(['admin', 'vet', 'assistant']), 
  validateRequest(updateClientSchema), 
  updateClient
);

/**
 * @route DELETE /api/clients/:id
 * @desc Deletar cliente
 * @access Private (Admin only)
 */
router.delete('/:id', requireRole(['admin']), deleteClient);

export default router;