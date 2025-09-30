# src/auth.py
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import os
import uuid
from dotenv import load_dotenv

from . import crud, schemas, database  # Importar crud, schemas e database

# Carregar variáveis de ambiente
load_dotenv()

# --- CONFIGURAÇÃO DE SEGURANÇA DO TOKEN ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-here-change-in-production-32-chars-minimum")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# --- Contexto de Senha ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- OAuth2 ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

# --- Modelo para dados do token movido para schemas.py ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- FUNÇÃO DE AUTENTICAÇÃO CORRIGIDA E CENTRALIZADA ---
def authenticate_user(db: Session, username: str, password: str) -> Optional[schemas.UserInDB]:
    """
    Busca o usuário no banco de dados e verifica a senha.
    Retorna o objeto do usuário se for válido, senão None.
    """
    user = crud.get_user_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# --- FUNÇÕES JWT ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Adiciona JTI (JWT ID) único para rastreamento
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "jti": jti, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Adiciona JTI (JWT ID) único para rastreamento
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "jti": jti, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def is_token_revoked(jti: str, db: Session) -> bool:
    """Verifica se um token foi revogado (com cache Redis)"""
    from .cache import is_token_revoked_cache
    from .models import RevokedToken
    
    # Primeiro verifica no cache Redis
    if is_token_revoked_cache(jti):
        return True
    
    # Se não estiver no cache, verifica no banco
    revoked_token = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    
    # Se encontrou no banco, adiciona ao cache
    if revoked_token:
        from .cache import cache_revoked_token
        # Calcula tempo até expiração
        import time
        expire_seconds = int(revoked_token.expires_at.timestamp() - time.time())
        if expire_seconds > 0:
            cache_revoked_token(jti, expire_seconds)
        return True
    
    return False

def revoke_token(jti: str, user_id: str, token_type: str, reason: str, expires_at: datetime, db: Session):
    """Adiciona um token à blacklist (com cache Redis)"""
    from .models import RevokedToken
    from .cache import cache_revoked_token, invalidate_user_session
    
    # Adiciona ao banco
    revoked_token = RevokedToken(
        id=str(uuid.uuid4()),
        jti=jti,
        user_id=user_id,
        token_type=token_type,
        expires_at=expires_at,
        reason=reason
    )
    db.add(revoked_token)
    db.commit()
    
    # Adiciona ao cache Redis
    import time
    expire_seconds = int(expires_at.timestamp() - time.time())
    if expire_seconds > 0:
        cache_revoked_token(jti, expire_seconds)
    
    # Invalida sessão do usuário no cache
    invalidate_user_session(user_id)

def revoke_all_user_tokens(user_id: str, reason: str, db: Session):
    """Revoga todos os tokens de um usuário (útil para mudança de senha)"""
    from .models import RevokedToken
    # Aqui você precisaria manter uma lista de tokens ativos por usuário
    # Por simplicidade, vamos apenas marcar a data de revogação
    # Em produção, considere usar Redis para performance
    pass

def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)) -> schemas.TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        jti: str = payload.get("jti")
        
        if username is None or user_id is None or jti is None:
            raise credentials_exception
        
        # Verifica se o token foi revogado
        if is_token_revoked(jti, db):
            raise credentials_exception
        
        token_data = schemas.TokenData(username=username, user_id=user_id)
    except JWTError:
        raise credentials_exception
    return token_data

def get_current_user_from_token_string(token: str, db: Session) -> Optional[schemas.UserInDB]:
    """
    Valida um token JWT fornecido como string e retorna o usuário correspondente.
    Usado para autenticação WebSocket.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        jti: str = payload.get("jti")
        
        if username is None or user_id is None or jti is None:
            return None
        
        # Verifica se o token foi revogado
        if is_token_revoked(jti, db):
            return None
        
        # Buscar o usuário no banco de dados
        user = crud.get_user_by_username(db, username=username)
        if user is None or not user.is_active:
            return None
        
        return user
    except JWTError:
        return None

def verify_password_reset_token(token: str) -> Optional[str]:
    """Decodifica um token de reset, verifica sua validade e retorna o email."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def get_current_active_user(
    token_data: schemas.TokenData = Depends(get_current_user_from_token),
    db: Session = Depends(database.get_db)
):
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user