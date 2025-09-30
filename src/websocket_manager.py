# src/websocket_manager.py
import asyncio
import json
import redis.asyncio as redis
import logging
from typing import Dict, List, Set, Optional, Any
from fastapi import WebSocket
from datetime import datetime
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Gerenciador de WebSocket com clustering Redis"""
    
    def __init__(self):
        # Conexões WebSocket locais (nesta instância)
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Cliente Redis para pub/sub
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub = None
        
        # ID único desta instância
        self.instance_id = f"ws_instance_{os.getpid()}_{datetime.now().timestamp()}"
        
        # Task para escutar mensagens Redis
        self.redis_listener_task: Optional[asyncio.Task] = None
        
        # Estatísticas
        self.stats = {
            "total_connections": 0,
            "active_rooms": 0,
            "messages_sent": 0,
            "messages_received": 0,
            "redis_available": False
        }
    
    async def initialize_redis(self):
        """Inicializa conexão Redis para pub/sub"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Testa a conexão
            await self.redis_client.ping()
            
            # Configura pub/sub
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe("websocket:broadcast")
            
            # Inicia listener em background
            self.redis_listener_task = asyncio.create_task(self._redis_listener())
            
            self.stats["redis_available"] = True
            logger.info(f"✅ WebSocket Redis clustering ativo - Instância: {self.instance_id}")
            
        except Exception as e:
            logger.warning(f"⚠️ Redis clustering não disponível: {e}")
            self.stats["redis_available"] = False
    
    async def _redis_listener(self):
        """Escuta mensagens Redis pub/sub"""
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    await self._handle_redis_message(message["data"])
        except Exception as e:
            logger.error(f"Erro no Redis listener: {e}")
    
    async def _handle_redis_message(self, data: str):
        """Processa mensagem recebida via Redis"""
        try:
            message_data = json.loads(data)
            
            # Ignora mensagens da própria instância
            if message_data.get("instance_id") == self.instance_id:
                return
            
            room_id = message_data.get("room_id")
            message_content = message_data.get("message")
            
            if room_id and message_content:
                # Envia para conexões locais desta instância
                await self._broadcast_to_local_room(room_id, message_content)
                self.stats["messages_received"] += 1
                
        except Exception as e:
            logger.error(f"Erro ao processar mensagem Redis: {e}")
    
    async def connect(self, websocket: WebSocket, room_id: str, user_id: str = None):
        """Conecta WebSocket a uma sala"""
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        
        self.active_connections[room_id].append(websocket)
        
        # Adiciona metadados ao WebSocket
        websocket.user_id = user_id
        websocket.room_id = room_id
        websocket.connected_at = datetime.now()
        
        self.stats["total_connections"] += 1
        self.stats["active_rooms"] = len(self.active_connections)
        
        logger.info(f"WebSocket conectado - Sala: {room_id}, Usuário: {user_id}, Instância: {self.instance_id}")
        
        # Notifica outras instâncias sobre nova conexão
        await self._notify_connection_event(room_id, user_id, "connected")
    
    async def disconnect(self, websocket: WebSocket):
        """Desconecta WebSocket"""
        room_id = getattr(websocket, 'room_id', None)
        user_id = getattr(websocket, 'user_id', None)
        
        if room_id and room_id in self.active_connections:
            try:
                self.active_connections[room_id].remove(websocket)
                
                # Remove sala se não há mais conexões
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
                
                self.stats["total_connections"] -= 1
                self.stats["active_rooms"] = len(self.active_connections)
                
                logger.info(f"WebSocket desconectado - Sala: {room_id}, Usuário: {user_id}")
                
                # Notifica outras instâncias sobre desconexão
                await self._notify_connection_event(room_id, user_id, "disconnected")
                
            except ValueError:
                pass  # WebSocket já foi removido
    
    async def broadcast_to_room(self, room_id: str, message: str, exclude_instance: bool = False):
        """Envia mensagem para todos na sala (todas as instâncias)"""
        # Envia para conexões locais
        await self._broadcast_to_local_room(room_id, message)
        
        # Envia via Redis para outras instâncias
        if self.redis_client and not exclude_instance:
            await self._broadcast_via_redis(room_id, message)
        
        self.stats["messages_sent"] += 1
    
    async def _broadcast_to_local_room(self, room_id: str, message: str):
        """Envia mensagem apenas para conexões locais da sala"""
        if room_id not in self.active_connections:
            return
        
        # Lista de conexões a serem removidas (mortas)
        dead_connections = []
        
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Conexão WebSocket morta detectada: {e}")
                dead_connections.append(connection)
        
        # Remove conexões mortas
        for dead_conn in dead_connections:
            await self.disconnect(dead_conn)
    
    async def _broadcast_via_redis(self, room_id: str, message: str):
        """Envia mensagem via Redis pub/sub"""
        if not self.redis_client:
            return
        
        try:
            redis_message = {
                "instance_id": self.instance_id,
                "room_id": room_id,
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
            
            await self.redis_client.publish(
                "websocket:broadcast", 
                json.dumps(redis_message)
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar via Redis: {e}")
    
    async def _notify_connection_event(self, room_id: str, user_id: str, event_type: str):
        """Notifica outras instâncias sobre eventos de conexão"""
        if not self.redis_client:
            return
        
        try:
            event_message = {
                "type": "connection_event",
                "event": event_type,
                "room_id": room_id,
                "user_id": user_id,
                "instance_id": self.instance_id,
                "timestamp": datetime.now().isoformat()
            }
            
            await self.redis_client.publish(
                "websocket:events", 
                json.dumps(event_message)
            )
            
        except Exception as e:
            logger.error(f"Erro ao notificar evento: {e}")
    
    async def send_to_user(self, user_id: str, message: str, room_id: str = None):
        """Envia mensagem para um usuário específico"""
        sent = False
        
        # Procura nas conexões locais
        for room, connections in self.active_connections.items():
            if room_id and room != room_id:
                continue
                
            for connection in connections:
                if getattr(connection, 'user_id', None) == user_id:
                    try:
                        await connection.send_text(message)
                        sent = True
                    except Exception as e:
                        logger.warning(f"Erro ao enviar para usuário {user_id}: {e}")
                        await self.disconnect(connection)
        
        # Se não encontrou localmente, tenta via Redis
        if not sent and self.redis_client:
            await self._send_to_user_via_redis(user_id, message, room_id)
    
    async def _send_to_user_via_redis(self, user_id: str, message: str, room_id: str = None):
        """Envia mensagem para usuário via Redis"""
        try:
            redis_message = {
                "type": "user_message",
                "target_user_id": user_id,
                "room_id": room_id,
                "message": message,
                "instance_id": self.instance_id,
                "timestamp": datetime.now().isoformat()
            }
            
            await self.redis_client.publish(
                "websocket:user_messages", 
                json.dumps(redis_message)
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem de usuário via Redis: {e}")
    
    def get_room_connections_count(self, room_id: str) -> int:
        """Retorna número de conexões locais em uma sala"""
        return len(self.active_connections.get(room_id, []))
    
    def get_total_connections(self) -> int:
        """Retorna total de conexões locais"""
        return sum(len(connections) for connections in self.active_connections.values())
    
    def get_active_rooms(self) -> List[str]:
        """Retorna lista de salas ativas localmente"""
        return list(self.active_connections.keys())
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do WebSocket manager"""
        self.stats.update({
            "active_rooms": len(self.active_connections),
            "total_connections": self.get_total_connections(),
            "instance_id": self.instance_id
        })
        return self.stats.copy()
    
    async def cleanup(self):
        """Limpa recursos"""
        # Para o listener Redis
        if self.redis_listener_task:
            self.redis_listener_task.cancel()
            try:
                await self.redis_listener_task
            except asyncio.CancelledError:
                pass
        
        # Fecha pub/sub
        if self.pubsub:
            await self.pubsub.close()
        
        # Fecha cliente Redis
        if self.redis_client:
            await self.redis_client.close()
        
        logger.info(f"WebSocket manager limpo - Instância: {self.instance_id}")

# Instância global do manager
websocket_manager = WebSocketManager()

# Função para inicializar o manager
async def initialize_websocket_manager():
    """Inicializa o WebSocket manager com Redis"""
    await websocket_manager.initialize_redis()

# Função para cleanup
async def cleanup_websocket_manager():
    """Limpa recursos do WebSocket manager"""
    await websocket_manager.cleanup()