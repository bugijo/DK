import { Router } from 'express';
import { login, register, getProfile, logout, verifyToken } from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createUserSchema, loginSchema } from '../middleware/validation';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * @route POST /api/auth/register
 * @desc Registro de novo usuário (apenas para admins)
 * @access Private (Admin only)
 */
router.post('/register', 
  authenticateToken, 
  requireRole(['admin']), 
  validateRequest(createUserSchema), 
  register
);

/**
 * @route GET /api/auth/profile
 * @desc Obter perfil do usuário logado
 * @access Private
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route GET /api/auth/verify
 * @desc Verificar se token é válido
 * @access Private
 */
router.get('/verify', authenticateToken, verifyToken);

export default router;