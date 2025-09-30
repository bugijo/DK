#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wrapper FastAPI para integração com Trae IDE

Este wrapper converte requisições HTTP REST em comandos para o Trae IDE,
suportando diferentes métodos de comunicação (CLI, JSON-RPC, MCP).

Uso:
    uvicorn trae_wrapper:app --host 127.0.0.1 --port 8000
"""

import os
import json
import asyncio
import subprocess
import logging
import time
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime
from logging.handlers import RotatingFileHandler

from fastapi import FastAPI, HTTPException, Depends, Header, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv(dotenv_path=".env.wrapper")  # Configurações do wrapper
load_dotenv(dotenv_path=".env.telegram")  # Fallback para compatibilidade

# Configuração de logging com rotação
log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Handler para arquivo com rotação
file_handler = RotatingFileHandler(
    'trae_wrapper.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.INFO)

# Handler para console
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
console_handler.setLevel(logging.INFO)

# Configuração do logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Configuração de segurança
API_TOKEN = os.getenv("TRAE_WRAPPER_TOKEN", "your-secret-token-here")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")
MAX_EXECUTION_TIME = int(os.getenv("MAX_EXECUTION_TIME", "60"))  # segundos

# Estatísticas
stats = {
    "requests_total": 0,
    "requests_success": 0,
    "requests_error": 0,
    "avg_response_time": 0.0,
    "start_time": datetime.now()
}

app = FastAPI(
    title="Trae IDE Wrapper API",
    description="API wrapper para integração com Trae IDE via Telegram Bot",
    version="1.0.0"
)

# Middleware CORS restritivo
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://{host}" for host in ALLOWED_HOSTS] + [f"https://{host}" for host in ALLOWED_HOSTS],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Configuração de autenticação
security = HTTPBearer(auto_error=False)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> bool:
    """Verifica token de autenticação"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Token de autenticação necessário")
    
    if credentials.credentials != API_TOKEN:
        logger.warning(f"Tentativa de acesso com token inválido: {credentials.credentials[:10]}...")
        raise HTTPException(status_code=401, detail="Token inválido")
    
    return True

def verify_host(request: Request) -> bool:
    """Verifica se o host está na lista de permitidos"""
    client_host = request.client.host
    
    if client_host not in ALLOWED_HOSTS:
        logger.warning(f"Tentativa de acesso de host não autorizado: {client_host}")
        raise HTTPException(status_code=403, detail=f"Host {client_host} não autorizado")
    
    return True

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Middleware de segurança e logging"""
    start_time = time.time()
    client_ip = request.client.host
    
    # Log da requisição
    logger.info(f"📥 {request.method} {request.url.path} de {client_ip}")
    
    # Atualiza estatísticas
    stats["requests_total"] += 1
    
    try:
        response = await call_next(request)
        
        # Calcula tempo de resposta
        process_time = time.time() - start_time
        
        # Atualiza estatísticas
        if response.status_code < 400:
            stats["requests_success"] += 1
        else:
            stats["requests_error"] += 1
        
        # Atualiza tempo médio de resposta
        total_requests = stats["requests_success"] + stats["requests_error"]
        if total_requests > 0:
            stats["avg_response_time"] = (
                (stats["avg_response_time"] * (total_requests - 1) + process_time) / total_requests
            )
        
        # Log da resposta
        logger.info(f"📤 {response.status_code} em {process_time:.3f}s")
        
        # Adiciona headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
        
    except Exception as e:
        stats["requests_error"] += 1
        logger.error(f"💥 Erro no middleware: {e}")
        raise

# Modelos Pydantic
class TraeCommand(BaseModel):
    command: str
    args: Optional[Dict[str, Any]] = None
    timeout: Optional[int] = 30

class TraeResponse(BaseModel):
    result: Optional[str] = None
    error: Optional[str] = None
    status: str = "success"
    execution_time: Optional[float] = None

# Configurações
TRAE_CLI_PATH = os.getenv("TRAE_CLI_PATH", "trae")
TRAE_WORKSPACE = os.getenv("TRAE_WORKSPACE", os.getcwd())
AUTH_TOKEN = os.getenv("TRAE_WRAPPER_TOKEN", "")

# Middleware de autenticação simples
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """Middleware básico de autenticação por token"""
    if AUTH_TOKEN and request.url.path.startswith("/trae-"):
        auth_header = request.headers.get("Authorization")
        if not auth_header or auth_header != f"Bearer {AUTH_TOKEN}":
            raise HTTPException(status_code=401, detail="Token de autenticação inválido")
    
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    """Endpoint de status básico"""
    return {
        "service": "Trae IDE Wrapper",
        "status": "running",
        "version": "1.0.0",
        "workspace": TRAE_WORKSPACE
    }

@app.get("/health")
async def health_check():
    """Endpoint público de verificação de saúde"""
    try:
        # Testa se o Trae está acessível
        process = await asyncio.create_subprocess_exec(
            TRAE_CLI_PATH, "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await asyncio.wait_for(
            process.communicate(), 
            timeout=5.0
        )
        
        trae_available = process.returncode == 0
        trae_version = stdout.decode('utf-8').strip() if trae_available else None
        
        # Calcula uptime
        uptime = datetime.now() - stats["start_time"]
        uptime_seconds = int(uptime.total_seconds())
        
        return {
            "status": "healthy" if trae_available else "degraded",
            "timestamp": datetime.now().isoformat(),
            "trae_available": trae_available,
            "trae_version": trae_version,
            "api_version": "1.0.0",
            "uptime_seconds": uptime_seconds,
            "requests_total": stats["requests_total"],
            "success_rate": (
                stats["requests_success"] / max(stats["requests_total"], 1) * 100
            )
        }
        
    except Exception as e:
        logger.error(f"💥 Erro no health check: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "api_version": "1.0.0",
            "uptime_seconds": 0
        }

@app.get("/stats")
async def get_stats(
    _: bool = Depends(verify_token),
    __: bool = Depends(verify_host)
):
    """Endpoint protegido com estatísticas detalhadas"""
    uptime = datetime.now() - stats["start_time"]
    
    return {
        "timestamp": datetime.now().isoformat(),
        "uptime": {
            "seconds": int(uptime.total_seconds()),
            "human": str(uptime).split('.')[0]  # Remove microsegundos
        },
        "requests": {
            "total": stats["requests_total"],
            "success": stats["requests_success"],
            "error": stats["requests_error"],
            "success_rate": (
                stats["requests_success"] / max(stats["requests_total"], 1) * 100
            )
        },
        "performance": {
            "avg_response_time": round(stats["avg_response_time"], 3)
        },
        "config": {
            "max_execution_time": MAX_EXECUTION_TIME,
            "allowed_hosts": ALLOWED_HOSTS,
            "trae_cli_path": TRAE_CLI_PATH
        }
    }

@app.get("/metrics")
async def get_metrics():
    """Endpoint público no formato Prometheus para observabilidade"""
    uptime_seconds = int((datetime.now() - stats["start_time"]).total_seconds())
    
    metrics = f"""# HELP trae_wrapper_requests_total Total number of requests
# TYPE trae_wrapper_requests_total counter
trae_wrapper_requests_total {stats["requests_total"]}

# HELP trae_wrapper_requests_success_total Total number of successful requests
# TYPE trae_wrapper_requests_success_total counter
trae_wrapper_requests_success_total {stats["requests_success"]}

# HELP trae_wrapper_requests_error_total Total number of error requests
# TYPE trae_wrapper_requests_error_total counter
trae_wrapper_requests_error_total {stats["requests_error"]}

# HELP trae_wrapper_response_time_avg Average response time in seconds
# TYPE trae_wrapper_response_time_avg gauge
trae_wrapper_response_time_avg {stats["avg_response_time"]}

# HELP trae_wrapper_uptime_seconds Uptime in seconds
# TYPE trae_wrapper_uptime_seconds counter
trae_wrapper_uptime_seconds {uptime_seconds}
"""
    
    from fastapi import Response
    return Response(content=metrics, media_type="text/plain")

@app.post("/trae-command", response_model=TraeResponse)
async def execute_trae_command(
    cmd: TraeCommand,
    request: Request,
    _: bool = Depends(verify_token),
    __: bool = Depends(verify_host)
):
    """Executa comando no Trae IDE com autenticação"""
    import time
    start_time = time.time()
    client_ip = request.client.host
    
    logger.info(f"🔧 Comando autenticado de {client_ip}: {cmd.command}")
    
    # Validação de comandos perigosos
    dangerous_commands = ['rm', 'del', 'format', 'shutdown', 'reboot', 'kill']
    if any(dangerous in cmd.command.lower() for dangerous in dangerous_commands):
        logger.warning(f"⚠️ Comando perigoso bloqueado: {cmd.command}")
        raise HTTPException(
            status_code=403,
            detail="Comando potencialmente perigoso foi bloqueado por segurança"
        )
    
    try:
        # Método 1: CLI direto (ajuste conforme sua instalação do Trae)
        result = await execute_via_cli(cmd)
        
        # Método 2: JSON-RPC (descomente se usar)
        # result = await execute_via_jsonrpc(cmd)
        
        # Método 3: MCP (descomente se usar)
        # result = await execute_via_mcp(cmd)
        
        execution_time = time.time() - start_time
        logger.info(f"✅ Comando executado em {execution_time:.2f}s")
        
        return TraeResponse(
            result=result.get("result"),
            error=result.get("error"),
            status="success" if not result.get("error") else "error",
            execution_time=execution_time
        )
        
    except asyncio.TimeoutError:
        logger.error(f"⏰ Timeout ao executar comando: {cmd.command}")
        raise HTTPException(
            status_code=408,
            detail=f"Comando demorou mais que {cmd.timeout}s para executar"
        )
    except PermissionError:
        logger.error(f"🔒 Sem permissão para executar: {cmd.command}")
        raise HTTPException(
            status_code=403,
            detail="Sem permissão para executar este comando"
        )
    except Exception as e:
        logger.error(f"💥 Erro ao executar comando: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def execute_via_cli(cmd: TraeCommand) -> Dict[str, Any]:
    """Executa comando via CLI do Trae"""
    try:
        # Constrói comando CLI
        cli_args = [TRAE_CLI_PATH]
        
        # Mapeia comandos comuns
        command_map = {
            "status": ["status"],
            "create_file": ["create", "file"],
            "run_test": ["test", "run"],
            "build": ["build"],
            "deploy": ["deploy"]
        }
        
        if cmd.command in command_map:
            cli_args.extend(command_map[cmd.command])
        else:
            # Comando customizado
            cli_args.extend(cmd.command.split())
        
        # Adiciona argumentos se fornecidos
        if cmd.args:
            for key, value in cmd.args.items():
                cli_args.extend([f"--{key}", str(value)])
        
        logger.debug(f"Executando CLI: {' '.join(cli_args)}")
        
        # Executa comando
        proc = await asyncio.create_subprocess_exec(
            *cli_args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=TRAE_WORKSPACE
        )
        
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), 
            timeout=cmd.timeout
        )
        
        if proc.returncode == 0:
            return {
                "result": stdout.decode().strip(),
                "error": None
            }
        else:
            return {
                "result": None,
                "error": stderr.decode().strip()
            }
            
    except Exception as e:
        return {
            "result": None,
            "error": f"Erro na execução CLI: {str(e)}"
        }

async def execute_via_jsonrpc(cmd: TraeCommand) -> Dict[str, Any]:
    """Executa comando via JSON-RPC (implementar conforme protocolo do Trae)"""
    # TODO: Implementar comunicação JSON-RPC
    # Exemplo de estrutura:
    
    try:
        jsonrpc_payload = {
            "jsonrpc": "2.0",
            "method": cmd.command,
            "params": cmd.args or {},
            "id": 1
        }
        
        # Aqui você implementaria a comunicação via socket/stdin/stdout
        # conforme o protocolo específico do Trae IDE
        
        return {
            "result": "JSON-RPC não implementado ainda",
            "error": None
        }
        
    except Exception as e:
        return {
            "result": None,
            "error": f"Erro JSON-RPC: {str(e)}"
        }

async def execute_via_mcp(cmd: TraeCommand) -> Dict[str, Any]:
    """Executa comando via MCP (Model Context Protocol)"""
    # TODO: Implementar comunicação MCP
    try:
        # Implementar conforme especificação MCP do Trae
        return {
            "result": "MCP não implementado ainda",
            "error": None
        }
        
    except Exception as e:
        return {
            "result": None,
            "error": f"Erro MCP: {str(e)}"
        }

@app.post("/trae-file")
async def handle_file_operation(request: Request):
    """Endpoint para operações de arquivo (upload/download)"""
    # TODO: Implementar upload/download de arquivos
    return {"message": "Operações de arquivo serão implementadas"}

if __name__ == "__main__":
    import uvicorn
    
    # Log de inicialização com informações de segurança
    logger.info("🚀 Iniciando Trae Wrapper API...")
    logger.info(f"📁 Trae CLI Path: {TRAE_CLI_PATH}")
    logger.info(f"🔒 Hosts permitidos: {', '.join(ALLOWED_HOSTS)}")
    logger.info(f"⏱️ Timeout máximo: {MAX_EXECUTION_TIME}s")
    logger.info(f"🔑 Token configurado: {'✅' if API_TOKEN != 'your-secret-token-here' else '❌ USAR TOKEN PADRÃO É INSEGURO!'}")
    
    # Aviso de segurança
    if API_TOKEN == "your-secret-token-here":
        logger.warning("⚠️ ATENÇÃO: Usando token padrão! Configure TRAE_WRAPPER_TOKEN no .env")
    
    try:
        uvicorn.run(
            "trae_wrapper:app",
            host="127.0.0.1",
            port=8000,
            reload=False,  # Desabilitado para produção
            log_level="info",
            access_log=True,
            server_header=False,  # Remove header Server
            date_header=False     # Remove header Date
        )
    except KeyboardInterrupt:
        logger.info("🛑 Wrapper API interrompido pelo usuário")
    except Exception as e:
        logger.error(f"💥 Erro fatal ao iniciar API: {e}")
        raise