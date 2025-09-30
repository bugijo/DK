// Tipos para os níveis de log
type LogLevel = {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  private currentLevel: number;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    this.currentLevel = this.getLevelNumber(envLevel);
  }

  private getLevelNumber(level: string): number {
    switch (level) {
      case 'error': return LOG_LEVELS.ERROR;
      case 'warn': return LOG_LEVELS.WARN;
      case 'info': return LOG_LEVELS.INFO;
      case 'debug': return LOG_LEVELS.DEBUG;
      default: return LOG_LEVELS.INFO;
    }
  }

  private formatMessage(level: string, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  private log(level: number, levelName: string, message: string, ...args: unknown[]): void {
    if (level <= this.currentLevel) {
      const formattedMessage = this.formatMessage(levelName, message, ...args);
      
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(formattedMessage);
          break;
        case LOG_LEVELS.WARN:
          console.warn(formattedMessage);
          break;
        case LOG_LEVELS.INFO:
          console.info(formattedMessage);
          break;
        case LOG_LEVELS.DEBUG:
          console.debug(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.ERROR, 'error', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.WARN, 'warn', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.INFO, 'info', message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.DEBUG, 'debug', message, ...args);
  }

  // Método para logging de requisições HTTP
  request(method: string, url: string, statusCode: number, responseTime?: number): void {
    const message = `${method} ${url} - ${statusCode}${responseTime ? ` - ${responseTime}ms` : ''}`;
    
    if (statusCode >= 500) {
      this.error(message);
    } else if (statusCode >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  // Método para logging de operações de banco de dados
  database(operation: string, table: string, duration?: number, error?: Error): void {
    const message = `DB ${operation} on ${table}${duration ? ` - ${duration}ms` : ''}`;
    
    if (error) {
      this.error(message, error.message);
    } else {
      this.debug(message);
    }
  }

  // Método para logging de autenticação
  auth(operation: string, userId?: string, success?: boolean): void {
    const message = `AUTH ${operation}${userId ? ` for user ${userId}` : ''}${success !== undefined ? ` - ${success ? 'SUCCESS' : 'FAILED'}` : ''}`;
    
    if (success === false) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  // Método para logging de validação
  validation(field: string, value: unknown, valid: boolean): void {
    const message = `VALIDATION ${field}: ${value} - ${valid ? 'VALID' : 'INVALID'}`;
    
    if (!valid) {
      this.warn(message);
    } else {
      this.debug(message);
    }
  }

  // Método para logging de performance
  performance(operation: string, duration: number, threshold: number = 1000): void {
    const message = `PERFORMANCE ${operation} - ${duration}ms`;
    
    if (duration > threshold) {
      this.warn(message + ' (SLOW)');
    } else {
      this.debug(message);
    }
  }
}

// Exportar instância singleton
export const logger = new Logger();

// Exportar classe para testes
export { Logger };