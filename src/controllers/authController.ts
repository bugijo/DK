import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { CreateUserData } from '../types';

// Login de usuário
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário por email (com senha)
    const user = await UserModel.findByEmailWithPassword(email);
    
    if (!user) {
      logger.auth('Login attempt', email, false);
      res.status(401).json({
        error: 'Credenciais inválidas',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      logger.auth('Login attempt', user.id, false);
      res.status(401).json({
        error: 'Credenciais inválidas',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Gerar token JWT
    const token = generateToken(user.id, user.email, user.role);
    
    logger.auth('Login successful', user.id, true);
    
    res.status(200).json({
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Registro de usuário (apenas para admins)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserData = req.body;
    
    // Verificar se email já existe
    const existingUser = await UserModel.findByEmail(userData.email);
    
    if (existingUser) {
      res.status(409).json({
        error: 'Email já está em uso',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Criar novo usuário
    const newUser = await UserModel.create(userData);
    
    logger.info('Novo usuário criado:', newUser.id);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      data: newUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Obter perfil do usuário logado
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Perfil obtido com sucesso',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Logout (invalidar token - implementação básica)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Em uma implementação real, você poderia:
    // 1. Adicionar o token a uma blacklist
    // 2. Usar refresh tokens
    // 3. Reduzir o tempo de expiração do token
    
    if (req.user) {
      logger.auth('Logout', req.user.id, true);
    }
    
    res.status(200).json({
      message: 'Logout realizado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};

// Verificar se token é válido
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Token inválido',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      message: 'Token válido',
      data: {
        user: req.user,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
};