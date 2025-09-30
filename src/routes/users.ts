import { Router } from 'express';
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  getUsersByRole,
  countUsers,
  getUserByEmail,
} from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createUserSchema, updateUserSchema } from '../middleware/validation';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @route POST /api/users
 * @desc Criar novo usuário
 * @access Private (Admin only)
 */
router.post('/', 
  requireRole(['admin']), 
  validateRequest(createUserSchema), 
  createUser
);

/**
 * @route GET /api/users
 * @desc Listar usuários com paginação e filtros
 * @access Private (Admin only)
 */
router.get('/', requireRole(['admin']), getUsers);

/**
 * @route GET /api/users/count
 * @desc Contar usuários
 * @access Private (Admin only)
 */
router.get('/count', requireRole(['admin']), countUsers);

/**
 * @route GET /api/users/role/:role
 * @desc Buscar usuários por role
 * @access Private (Admin only)
 */
router.get('/role/:role', requireRole(['admin']), getUsersByRole);

/**
 * @route GET /api/users/email/:email
 * @desc Buscar usuário por email
 * @access Private (Admin only)
 */
router.get('/email/:email', requireRole(['admin']), getUserByEmail);

/**
 * @route GET /api/users/:id
 * @desc Obter usuário por ID
 * @access Private (Admin only)
 */
router.get('/:id', requireRole(['admin']), getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Atualizar usuário
 * @access Private (Admin only)
 */
router.put('/:id', 
  requireRole(['admin']), 
  validateRequest(updateUserSchema), 
  updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Deletar usuário
 * @access Private (Admin only)
 */
router.delete('/:id', requireRole(['admin']), deleteUser);

export default router;