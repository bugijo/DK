# src/optimization_middleware.py
import json
import gzip
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class OptimizationMiddleware(BaseHTTPMiddleware):
    """Middleware para otimizações de performance"""
    
    def __init__(self, app, enable_json_minification: bool = True, enable_cache_headers: bool = True):
        super().__init__(app)
        self.enable_json_minification = enable_json_minification
        self.enable_cache_headers = enable_cache_headers
        
        # Cache headers para diferentes tipos de conteúdo
        self.cache_headers = {
            # Assets estáticos - cache longo
            'static': {
                'Cache-Control': 'public, max-age=31536000, immutable',  # 1 ano
                'Expires': time.strftime('%a, %d %b %Y %H:%M:%S GMT', 
                                       time.gmtime(time.time() + 31536000))
            },
            # API responses - cache curto
            'api': {
                'Cache-Control': 'public, max-age=300',  # 5 minutos
                'Vary': 'Accept-Encoding, Authorization'
            },
            # Dados dinâmicos - sem cache
            'dynamic': {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Processa a requisição
        response = await call_next(request)
        
        # Aplica otimizações na resposta
        response = await self._optimize_response(request, response)
        
        # Adiciona headers de performance
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    async def _optimize_response(self, request: Request, response: Response) -> Response:
        """Aplica otimizações na resposta"""
        
        # Determina o tipo de conteúdo
        content_type = self._get_content_type(request.url.path)
        
        # Adiciona cache headers apropriados
        if self.enable_cache_headers:
            self._add_cache_headers(response, content_type)
        
        # Minifica JSON se aplicável
        if (self.enable_json_minification and 
            isinstance(response, JSONResponse) and 
            hasattr(response, 'body')):
            response = await self._minify_json_response(response)
        
        # Adiciona headers de segurança e performance
        self._add_security_headers(response)
        self._add_performance_headers(response)
        
        return response
    
    def _get_content_type(self, path: str) -> str:
        """Determina o tipo de conteúdo baseado no path"""
        if path.startswith('/static/'):
            return 'static'
        elif path.startswith('/api/'):
            # Endpoints dinâmicos que mudam frequentemente
            dynamic_endpoints = ['/api/v1/tables', '/api/v1/characters', '/api/v1/users/me']
            if any(path.startswith(endpoint) for endpoint in dynamic_endpoints):
                return 'dynamic'
            return 'api'
        else:
            return 'dynamic'
    
    def _add_cache_headers(self, response: Response, content_type: str):
        """Adiciona headers de cache apropriados"""
        headers = self.cache_headers.get(content_type, self.cache_headers['dynamic'])
        for key, value in headers.items():
            response.headers[key] = value
    
    async def _minify_json_response(self, response: JSONResponse) -> JSONResponse:
        """Minifica resposta JSON removendo espaços desnecessários"""
        try:
            if hasattr(response, 'body') and response.body:
                # Decodifica o JSON
                json_data = json.loads(response.body.decode('utf-8'))
                
                # Re-serializa sem espaços (minificado)
                minified_json = json.dumps(json_data, separators=(',', ':'), ensure_ascii=False)
                
                # Cria nova resposta com JSON minificado
                new_response = JSONResponse(
                    content=json_data,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type
                )
                
                # Força o body minificado
                new_response.body = minified_json.encode('utf-8')
                
                # Atualiza Content-Length
                new_response.headers['Content-Length'] = str(len(new_response.body))
                
                return new_response
                
        except Exception as e:
            logger.warning(f"Erro ao minificar JSON: {e}")
        
        return response
    
    def _add_security_headers(self, response: Response):
        """Adiciona headers de segurança"""
        security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
        
        for key, value in security_headers.items():
            if key not in response.headers:
                response.headers[key] = value
    
    def _add_performance_headers(self, response: Response):
        """Adiciona headers de performance"""
        performance_headers = {
            'X-DNS-Prefetch-Control': 'on',
            'X-Permitted-Cross-Domain-Policies': 'none'
        }
        
        for key, value in performance_headers.items():
            if key not in response.headers:
                response.headers[key] = value

class BrotliMiddleware(BaseHTTPMiddleware):
    """Middleware para compressão Brotli (alternativa ao gzip)"""
    
    def __init__(self, app, minimum_size: int = 1000, quality: int = 4):
        super().__init__(app)
        self.minimum_size = minimum_size
        self.quality = quality  # 0-11, onde 11 é máxima compressão
        
        # Verifica se brotli está disponível
        try:
            import brotli
            self.brotli_available = True
            self.brotli = brotli
        except ImportError:
            self.brotli_available = False
            logger.warning("Brotli não disponível. Instale com: pip install brotli")
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.brotli_available:
            return await call_next(request)
        
        response = await call_next(request)
        
        # Verifica se o cliente suporta brotli
        accept_encoding = request.headers.get('accept-encoding', '')
        if 'br' not in accept_encoding.lower():
            return response
        
        # Verifica se deve comprimir
        if not self._should_compress(response):
            return response
        
        # Comprime com brotli
        return await self._compress_response(response)
    
    def _should_compress(self, response: Response) -> bool:
        """Verifica se a resposta deve ser comprimida"""
        # Não comprime se já está comprimido
        if 'content-encoding' in response.headers:
            return False
        
        # Verifica tamanho mínimo
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) < self.minimum_size:
            return False
        
        # Verifica tipo de conteúdo
        content_type = response.headers.get('content-type', '')
        compressible_types = [
            'text/', 'application/json', 'application/javascript',
            'application/xml', 'application/rss+xml'
        ]
        
        return any(content_type.startswith(ct) for ct in compressible_types)
    
    async def _compress_response(self, response: Response) -> Response:
        """Comprime a resposta com brotli"""
        try:
            if hasattr(response, 'body') and response.body:
                # Comprime o conteúdo
                compressed_body = self.brotli.compress(
                    response.body, 
                    quality=self.quality
                )
                
                # Atualiza headers
                response.headers['content-encoding'] = 'br'
                response.headers['content-length'] = str(len(compressed_body))
                response.headers['vary'] = 'Accept-Encoding'
                
                # Substitui o body
                response.body = compressed_body
                
                logger.debug(f"Brotli compression: {len(response.body)} -> {len(compressed_body)} bytes")
                
        except Exception as e:
            logger.error(f"Erro na compressão brotli: {e}")
        
        return response

# Middleware para otimização de assets estáticos
class StaticOptimizationMiddleware(BaseHTTPMiddleware):
    """Middleware para otimização de assets estáticos"""
    
    def __init__(self, app):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Aplica otimizações apenas para assets estáticos
        if request.url.path.startswith('/static/'):
            self._optimize_static_response(response, request.url.path)
        
        return response
    
    def _optimize_static_response(self, response: Response, path: str):
        """Otimiza resposta de assets estáticos"""
        # Headers de cache agressivo para assets
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        response.headers['Expires'] = time.strftime(
            '%a, %d %b %Y %H:%M:%S GMT', 
            time.gmtime(time.time() + 31536000)
        )
        
        # ETag para validação de cache
        if 'etag' not in response.headers:
            # Gera ETag simples baseado no path e tamanho
            content_length = response.headers.get('content-length', '0')
            etag = f'"{hash(path + content_length)}"'
            response.headers['ETag'] = etag
        
        # Headers específicos por tipo de arquivo
        if path.endswith(('.js', '.mjs')):
            response.headers['Content-Type'] = 'application/javascript; charset=utf-8'
        elif path.endswith('.css'):
            response.headers['Content-Type'] = 'text/css; charset=utf-8'
        elif path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            response.headers['Content-Type'] = f'image/{path.split(".")[-1]}'
        elif path.endswith('.svg'):
            response.headers['Content-Type'] = 'image/svg+xml; charset=utf-8'