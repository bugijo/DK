import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import petRoutes from './routes/pets';
import userRoutes from './routes/users';
import supplierRoutes from './routes/suppliers';
import accountsPayableRoutes from './routes/accountsPayable';
import accountsReceivableRoutes from './routes/accountsReceivable';
import appointmentRoutes from './routes/appointments';
import medicalRecordRoutes from './routes/medicalRecords';
import productRoutes from './routes/products';
import stockMovementRoutes from './routes/stockMovements';
import { logger } from './utils/logger';
import { supabase } from './config/database';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares de segurança
app.use(helmet());
app.use(limiter);

// Middlewares básicos
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da Clínica Veterinária! 🐾',
    documentation: '/api-docs',
    health: '/health',
    version: '1.0.0',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/accounts-payable', accountsPayableRoutes);
app.use('/api/accounts-receivable', accountsReceivableRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockMovementRoutes);

// Middleware de erro 404
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Função para testar conexão com o banco
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.error('Erro ao conectar com o banco de dados:', error);
      return false;
    }
    
    logger.info('Conexão com o banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.error('Erro ao testar conexão com o banco:', error);
    return false;
  }
}

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com o banco
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      logger.error('Falha na conexão com o banco de dados. Servidor não será iniciado.');
      process.exit(1);
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 API da Clínica Veterinária iniciada com sucesso!`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('🔧 Modo de desenvolvimento ativo');
      }
    });
    
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor graciosamente...');
  process.exit(0);
});

// Iniciar aplicação
startServer();

export default app;
