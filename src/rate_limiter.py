# src/rate_limiter.py
from typing import Dict, List
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

class WebSocketRateLimiter:
    """Rate limiter para eventos WebSocket"""
    
    def __init__(self):
        # Armazena timestamps dos eventos por usuário e tipo
        self.events: Dict[str, Dict[str, List[datetime]]] = defaultdict(lambda: defaultdict(list))
        # Configurações de limite por tipo de evento
        self.limits = {
            "chat": {"count": 20, "window": timedelta(seconds=10)},
            "dice_roll": {"count": 20, "window": timedelta(seconds=10)},
            "map_move": {"count": 10, "window": timedelta(seconds=5)},
            "update_tokens": {"count": 10, "window": timedelta(seconds=5)}
        }
    
    def is_allowed(self, user_id: str, event_type: str) -> bool:
        """Verifica se o usuário pode executar o evento"""
        if event_type not in self.limits:
            return True
        
        now = datetime.now()
        limit_config = self.limits[event_type]
        window_start = now - limit_config["window"]
        
        # Remove eventos antigos
        self.events[user_id][event_type] = [
            timestamp for timestamp in self.events[user_id][event_type]
            if timestamp > window_start
        ]
        
        # Verifica se está dentro do limite
        if len(self.events[user_id][event_type]) >= limit_config["count"]:
            return False
        
        # Adiciona o evento atual
        self.events[user_id][event_type].append(now)
        return True
    
    def cleanup_old_events(self):
        """Remove eventos antigos para economizar memória"""
        now = datetime.now()
        max_window = max(config["window"] for config in self.limits.values())
        cutoff = now - max_window
        
        for user_id in list(self.events.keys()):
            for event_type in list(self.events[user_id].keys()):
                self.events[user_id][event_type] = [
                    timestamp for timestamp in self.events[user_id][event_type]
                    if timestamp > cutoff
                ]
                
                # Remove listas vazias
                if not self.events[user_id][event_type]:
                    del self.events[user_id][event_type]
            
            # Remove usuários sem eventos
            if not self.events[user_id]:
                del self.events[user_id]

# Instância global do rate limiter
ws_rate_limiter = WebSocketRateLimiter()

# Task para limpeza periódica
async def cleanup_task():
    """Task que roda a cada 5 minutos para limpar eventos antigos"""
    while True:
        await asyncio.sleep(300)  # 5 minutos
        ws_rate_limiter.cleanup_old_events()