# src/main.py
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import asyncio
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
import os

from . import crud, models, schemas, auth
from .database import engine, get_db
from .routers import users, tables, characters, items, monsters, npcs, stories, backup, game_ws
from .rate_limiter import cleanup_task
from .middleware import RequestIDMiddleware, MetricsMiddleware
from .optimization_middleware import OptimizationMiddleware, BrotliMiddleware, StaticOptimizationMiddleware

# Configuração do Sentry para observabilidade
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            StarletteIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=0.1,  # 10% das transações para performance
        environment=os.getenv("ENVIRONMENT", "development"),
        release=os.getenv("RELEASE_VERSION", "1.0.0"),
    )

# Cria todas as tabelas no banco de dados se elas não existirem
models.Base.metadata.create_all(bind=engine)

# Configuração do Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Dungeon Keeper API",
    description="O motor para o seu universo de RPG.",
    version="1.0.0"
)

# Adiciona o rate limiter ao app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Adiciona middlewares de observabilidade e compressão
app.add_middleware(StaticOptimizationMiddleware)  # Otimizações para assets estáticos
app.add_middleware(BrotliMiddleware, minimum_size=500, quality=6)  # Compressão Brotli
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compressão GZip fallback
app.add_middleware(OptimizationMiddleware, enable_json_minification=True)  # Otimizações gerais
app.add_middleware(RequestIDMiddleware)
app.add_middleware(MetricsMiddleware)

# Inicia a task de limpeza do rate limiter WebSocket e WebSocket manager
@app.on_event("startup")
async def startup_event():
    from .websocket_manager import initialize_websocket_manager
    asyncio.create_task(cleanup_task())
    await initialize_websocket_manager()

@app.on_event("shutdown")
async def shutdown_event():
    from .websocket_manager import cleanup_websocket_manager
    await cleanup_websocket_manager()

# --- Configuração do CORS ---
# Esta é a configuração que permite que seu frontend (localhost:3000)
# converse com seu backend (localhost:8000).
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Monte um diretório estático para servir as imagens de avatar
app.mount("/avatars", StaticFiles(directory="static/avatars"), name="avatars")

# --- Inclusão dos Roteadores ---
# Incluindo todos os roteadores que criamos.
app.include_router(game_ws.router)
app.include_router(users.router)
app.include_router(backup.router)
app.include_router(characters.router)
app.include_router(items.router)
app.include_router(monsters.router)
app.include_router(npcs.router)
app.include_router(stories.router)
app.include_router(tables.router)

# --- Endpoints de Autenticação Refatorados ---
@app.post("/api/v1/register", response_model=schemas.UserBase)
@limiter.limit("3/minute")
def register_user(request: Request, user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    created_user = crud.create_user(db=db, user=user_in)
    return schemas.UserBase(username=created_user.username, email=created_user.email)

@app.post("/api/v1/token", response_model=schemas.TokenWithRefresh)
@limiter.limit("5/minute")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Esta chamada deve usar a função centralizada do módulo auth
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Cria access token e refresh token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = auth.create_access_token(
        data={"sub": user.username, "user_id": user.id}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": user.username, "user_id": user.id}, expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Endpoint raiz para verificação de status
@app.get("/")
def read_root():
    return {"status": "Dungeon Keeper API está online e pronta para a aventura!"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Metrics endpoint
@app.get("/metrics")
def get_metrics():
    """Endpoint para métricas básicas (pode ser usado pelo Prometheus)"""
    # Obtém métricas do middleware
    metrics_middleware = None
    for middleware in app.user_middleware:
        if hasattr(middleware, 'cls') and middleware.cls.__name__ == 'MetricsMiddleware':
            metrics_middleware = middleware
            break
    
    if metrics_middleware and hasattr(metrics_middleware, 'kwargs'):
        middleware_instance = metrics_middleware.kwargs.get('app')
        if hasattr(middleware_instance, 'request_count'):
            return {
                "total_requests": middleware_instance.request_count,
                "total_errors": middleware_instance.error_count,
                "average_response_time": middleware_instance.total_time / middleware_instance.request_count if middleware_instance.request_count > 0 else 0,
                "error_rate": middleware_instance.error_count / middleware_instance.request_count if middleware_instance.request_count > 0 else 0,
                "uptime": "running",
                "version": "1.0.0"
            }
    
    return {
        "status": "metrics_available",
        "version": "1.0.0",
        "note": "Detailed metrics will be available after requests are processed"
    }

# Dashboard de monitoramento
@app.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Dashboard completo de monitoramento do sistema"""
    from .cache import cache
    from .websocket_manager import websocket_manager
    import psutil
    import time
    
    # Métricas do sistema
    system_metrics = {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent if hasattr(psutil.disk_usage('/'), 'percent') else 0,
        "uptime": time.time() - psutil.boot_time()
    }
    
    # Métricas do banco de dados
    try:
        # Contadores básicos
        total_users = db.query(models.User).count()
        total_tables = db.query(models.Table).count()
        active_tables = db.query(models.Table).filter(models.Table.is_active == True).count()
        total_characters = db.query(models.Character).count()
        total_stories = db.query(models.Story).count()
        
        db_metrics = {
            "total_users": total_users,
            "total_tables": total_tables,
            "active_tables": active_tables,
            "total_characters": total_characters,
            "total_stories": total_stories,
            "table_utilization": (active_tables / total_tables * 100) if total_tables > 0 else 0
        }
    except Exception as e:
        db_metrics = {"error": str(e)}
    
    # Métricas do Redis/Cache
    cache_metrics = cache.get_stats() if cache.is_available() else {"available": False}
    
    # Métricas do WebSocket
    ws_metrics = websocket_manager.get_stats()
    
    # Métricas da aplicação
    app_metrics = {
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "instance_id": os.getenv("INSTANCE_ID", "single"),
        "timestamp": time.time()
    }
    
    return {
        "system": system_metrics,
        "database": db_metrics,
        "cache": cache_metrics,
        "websocket": ws_metrics,
        "application": app_metrics
    }

# Refresh token endpoint
@app.post("/api/v1/refresh", response_model=schemas.TokenWithRefresh)
@limiter.limit("10/minute")
async def refresh_access_token(request: Request, refresh_request: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodifica o refresh token
        payload = jwt.decode(refresh_request.refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        jti: str = payload.get("jti")
        token_type: str = payload.get("type")
        
        if username is None or user_id is None or jti is None or token_type != "refresh":
            raise credentials_exception
        
        # Verifica se o refresh token foi revogado
        if auth.is_token_revoked(jti, db):
            raise credentials_exception
        
        # Busca o usuário
        user = crud.get_user_by_username(db, username=username)
        if not user or not user.is_active:
            raise credentials_exception
        
        # Revoga o refresh token atual (rotação)
        expires_at = datetime.utcfromtimestamp(payload.get("exp"))
        auth.revoke_token(jti, user_id, "refresh", "refresh_rotation", expires_at, db)
        
        # Cria novos tokens
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
        
        new_access_token = auth.create_access_token(
            data={"sub": user.username, "user_id": user.id}, expires_delta=access_token_expires
        )
        new_refresh_token = auth.create_refresh_token(
            data={"sub": user.username, "user_id": user.id}, expires_delta=refresh_token_expires
        )
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except JWTError:
        raise credentials_exception

# Logout endpoint
@app.post("/api/v1/logout")
@limiter.limit("10/minute")
async def logout(request: Request, refresh_request: schemas.RefreshTokenRequest, current_user: schemas.TokenData = Depends(auth.get_current_user_from_token), db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    
    try:
        # Decodifica o refresh token para obter o JTI
        payload = jwt.decode(refresh_request.refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        jti: str = payload.get("jti")
        expires_at = datetime.utcfromtimestamp(payload.get("exp"))
        
        if jti:
            # Revoga o refresh token
            auth.revoke_token(jti, current_user.user_id, "refresh", "logout", expires_at, db)
        
        return {"message": "Successfully logged out"}
        
    except JWTError:
        # Mesmo se não conseguir decodificar, considera logout bem-sucedido
        return {"message": "Successfully logged out"}