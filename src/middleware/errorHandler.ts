import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Interface para erros customizados
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

// Middleware para tratar rotas não encontradas
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: CustomError = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Middleware para tratar erros
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log do erro
  logger.error('Erro capturado:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Status code padrão
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor';

  // Tratar erros específicos
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados de entrada inválidos';
  }

  if (error.name === 'UnauthorizedError' || error.message.includes('jwt')) {
    statusCode = 401;
    message = 'Token de acesso inválido ou expirado';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  }

  if (error.code === '11000') {
    statusCode = 409;
    message = 'Recurso já existe';
  }

  // Resposta de erro
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Adicionar stack trace apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Função para criar erros customizados
export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Função para tratar erros assíncronos
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};