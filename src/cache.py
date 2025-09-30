# src/cache.py
import redis
import json
import os
from typing import Optional, Any, Dict
from datetime import timedelta
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

class RedisCache:
    """Cache Redis para sessões e dados frequentes"""
    
    def __init__(self):
        # Configuração do Redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        try:
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Testa a conexão
            self.redis_client.ping()
            self.available = True
            print("✅ Redis conectado com sucesso")
        except Exception as e:
            print(f"⚠️ Redis não disponível: {e}")
            self.redis_client = None
            self.available = False
    
    def is_available(self) -> bool:
        """Verifica se o Redis está disponível"""
        return self.available and self.redis_client is not None
    
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Define um valor no cache"""
        if not self.is_available():
            return False
        
        try:
            # Serializa o valor para JSON
            serialized_value = json.dumps(value) if not isinstance(value, str) else value
            
            if expire:
                return self.redis_client.setex(key, expire, serialized_value)
            else:
                return self.redis_client.set(key, serialized_value)
        except Exception as e:
            print(f"Erro ao definir cache {key}: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Obtém um valor do cache"""
        if not self.is_available():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value is None:
                return None
            
            # Tenta deserializar JSON
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                # Se não for JSON, retorna como string
                return value
        except Exception as e:
            print(f"Erro ao obter cache {key}: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Remove um valor do cache"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            print(f"Erro ao deletar cache {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Verifica se uma chave existe no cache"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            print(f"Erro ao verificar existência {key}: {e}")
            return False
    
    def expire(self, key: str, seconds: int) -> bool:
        """Define expiração para uma chave"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.expire(key, seconds))
        except Exception as e:
            print(f"Erro ao definir expiração {key}: {e}")
            return False
    
    def flush_all(self) -> bool:
        """Limpa todo o cache (usar com cuidado)"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.flushdb())
        except Exception as e:
            print(f"Erro ao limpar cache: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtém estatísticas do Redis"""
        if not self.is_available():
            return {"available": False}
        
        try:
            info = self.redis_client.info()
            return {
                "available": True,
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "0B"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "total_commands_processed": info.get("total_commands_processed", 0)
            }
        except Exception as e:
            print(f"Erro ao obter estatísticas: {e}")
            return {"available": False, "error": str(e)}

# Instância global do cache
cache = RedisCache()

# Funções de conveniência para cache de sessões
def cache_user_session(user_id: str, session_data: Dict[str, Any], expire_minutes: int = 30) -> bool:
    """Cacheia dados de sessão do usuário"""
    key = f"session:user:{user_id}"
    return cache.set(key, session_data, expire_minutes * 60)

def get_user_session(user_id: str) -> Optional[Dict[str, Any]]:
    """Obtém dados de sessão do usuário"""
    key = f"session:user:{user_id}"
    return cache.get(key)

def invalidate_user_session(user_id: str) -> bool:
    """Invalida sessão do usuário"""
    key = f"session:user:{user_id}"
    return cache.delete(key)

# Funções de conveniência para cache de dados frequentes
def cache_user_characters(user_id: str, characters: list, expire_minutes: int = 10) -> bool:
    """Cacheia personagens do usuário"""
    key = f"characters:user:{user_id}"
    return cache.set(key, characters, expire_minutes * 60)

def get_user_characters(user_id: str) -> Optional[list]:
    """Obtém personagens do usuário do cache"""
    key = f"characters:user:{user_id}"
    return cache.get(key)

def cache_active_tables(tables: list, expire_minutes: int = 5) -> bool:
    """Cacheia lista de mesas ativas"""
    key = "tables:active"
    return cache.set(key, tables, expire_minutes * 60)

def get_active_tables() -> Optional[list]:
    """Obtém lista de mesas ativas do cache"""
    key = "tables:active"
    return cache.get(key)

def cache_table_details(table_id: str, table_data: Dict[str, Any], expire_minutes: int = 15) -> bool:
    """Cacheia detalhes de uma mesa"""
    key = f"table:details:{table_id}"
    return cache.set(key, table_data, expire_minutes * 60)

def get_table_details(table_id: str) -> Optional[Dict[str, Any]]:
    """Obtém detalhes de uma mesa do cache"""
    key = f"table:details:{table_id}"
    return cache.get(key)

def invalidate_table_cache(table_id: str) -> bool:
    """Invalida cache relacionado a uma mesa"""
    keys_to_delete = [
        f"table:details:{table_id}",
        "tables:active"  # Invalida lista de mesas ativas também
    ]
    
    success = True
    for key in keys_to_delete:
        if not cache.delete(key):
            success = False
    
    return success

# Função para cache de JWT blacklist
def cache_revoked_token(jti: str, expire_seconds: int) -> bool:
    """Cacheia token revogado"""
    key = f"revoked:token:{jti}"
    return cache.set(key, "revoked", expire_seconds)

def is_token_revoked_cache(jti: str) -> bool:
    """Verifica se token está revogado no cache"""
    key = f"revoked:token:{jti}"
    return cache.exists(key)