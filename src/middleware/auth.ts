import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWTPayload, UserRole } from '../types';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Middleware de autenticação
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token de acesso requerido',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET não configurado');
      res.status(500).json({
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Verificar se o usuário ainda existe
    const user = await UserModel.findById(decoded.user_id);
    
    if (!user) {
      logger.auth('Token validation', decoded.user_id, false);
      res.status(401).json({
        error: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    logger.auth('Token validation', user.id, true);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.auth('Token validation', undefined, false);
      res.status(401).json({
        error: 'Token inválido',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.auth('Token validation', undefined, false);
      res.status(401).json({
        error: 'Token expirado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error('Erro na autenticação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Middleware de autorização por role
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.auth('Authorization denied', req.user.id, false);
      res.status(403).json({
        error: 'Acesso negado',
        details: `Role '${req.user.role}' não tem permissão para acessar este recurso`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.auth('Authorization granted', req.user.id, true);
    next();
  };
};

// Middleware para verificar se é admin
export const requireAdmin = authorize(['admin']);

// Middleware para verificar se é veterinário ou admin
export const requireVetOrAdmin = authorize(['veterinarian', 'admin']);

// Middleware para verificar se é recepcionista, veterinário ou admin
export const requireStaff = authorize(['receptionist', 'veterinarian', 'admin']);

// Middleware para verificar se o usuário pode acessar seus próprios dados
export const requireOwnershipOrAdmin = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const targetUserId = req.params[userIdParam];
    const isOwner = req.user.id === targetUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      logger.auth('Ownership check failed', req.user.id, false);
      res.status(403).json({
        error: 'Acesso negado',
        details: 'Você só pode acessar seus próprios dados',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.auth('Ownership check passed', req.user.id, true);
    next();
  };
};

// Middleware para extrair informações do usuário do token (opcional)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    const user = await UserModel.findById(decoded.user_id);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

// Função para gerar token JWT
export const generateToken = (userId: string, email: string, role: UserRole): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
  }

  const payload: JWTPayload = {
    user_id: userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Função para verificar token JWT
export const verifyToken = (token: string): JWTPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
  }

  return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
};

// Função para decodificar token sem verificar (útil para debug)
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};