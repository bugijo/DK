# src/middleware.py
import uuid
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

# Configuração de logging estruturado
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware para adicionar request-id único a cada requisição"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Gera um request-id único
        request_id = str(uuid.uuid4())
        
        # Adiciona o request-id ao contexto da requisição
        request.state.request_id = request_id
        
        # Adiciona headers de correlação
        start_time = time.time()
        
        # Log da requisição de entrada
        logger.info(
            "Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
        )
        
        try:
            # Processa a requisição
            response = await call_next(request)
            
            # Calcula o tempo de processamento
            process_time = time.time() - start_time
            
            # Adiciona o request-id ao header da resposta
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(process_time)
            
            # Log da resposta
            logger.info(
                "Request completed",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "process_time": process_time,
                }
            )
            
            return response
            
        except Exception as e:
            # Log de erro
            process_time = time.time() - start_time
            logger.error(
                "Request failed",
                extra={
                    "request_id": request_id,
                    "error": str(e),
                    "process_time": process_time,
                },
                exc_info=True
            )
            raise

class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware para coletar métricas básicas"""
    
    def __init__(self, app):
        super().__init__(app)
        self.request_count = 0
        self.error_count = 0
        self.total_time = 0.0
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        self.request_count += 1
        
        try:
            response = await call_next(request)
            
            # Coleta métricas
            process_time = time.time() - start_time
            self.total_time += process_time
            
            # Log de métricas (pode ser enviado para sistema de monitoramento)
            if self.request_count % 100 == 0:  # Log a cada 100 requisições
                avg_time = self.total_time / self.request_count
                logger.info(
                    "Metrics update",
                    extra={
                        "total_requests": self.request_count,
                        "total_errors": self.error_count,
                        "average_response_time": avg_time,
                        "error_rate": self.error_count / self.request_count if self.request_count > 0 else 0
                    }
                )
            
            return response
            
        except Exception as e:
            self.error_count += 1
            raise