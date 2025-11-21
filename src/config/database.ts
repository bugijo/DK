import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Garantir que as variáveis estejam carregadas mesmo quando o entrypoint não chamar dotenv
dotenv.config();

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  throw new Error(
    `Variáveis ausentes para conectar ao Supabase: ${missingEnv.join(', ')}. ` +
    'Defina-as no .env ou no ambiente (consulte docs/SUPABASE_SETUP.md).'
  );
}

// Criar cliente Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false, // Não persistir sessão no servidor
    },
    db: {
      schema: 'public',
    },
  }
);

// Função para testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      logger.error('Erro ao testar conexão com Supabase:', error);
      return false;
    }

    logger.info('Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.error('Erro ao conectar com Supabase:', error);
    return false;
  }
};

// Função para retry de operações
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        logger.error(`Operação falhou após ${maxRetries} tentativas:`, lastError);
        throw lastError;
      }

      logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Aumentar delay exponencialmente
      delay *= 2;
    }
  }

  throw lastError!;
};

// Função para inicializar banco de dados
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Inicializando conexão com banco de dados...');
    
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Falha ao conectar com o banco de dados');
    }

    logger.info('Banco de dados inicializado com sucesso');
  } catch (error) {
    logger.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Exportar tipos do Supabase se necessário
export type SupabaseClient = typeof supabase;