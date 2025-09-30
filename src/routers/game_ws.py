# src/routers/game_ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import json
import asyncio
from typing import Dict, List

from .. import auth, models
from ..database import get_db
from ..websocket_manager import websocket_manager
from ..rate_limiter import ws_rate_limiter

router = APIRouter()

@router.websocket("/ws/game/{table_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    table_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    # Valida o token JWT
    try:
        current_user = auth.get_current_user_from_token_string(token, db)
        if not current_user:
            await websocket.close(code=1008, reason="Token inválido")
            return
    except Exception as e:
        await websocket.close(code=1008, reason=f"Erro de autenticação: {str(e)}")
        return
    
    # Verifica se a mesa existe
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        await websocket.close(code=1008, reason="Mesa não encontrada")
        return
    
    # Conecta o WebSocket com clustering
    await websocket_manager.connect(websocket, table_id, current_user.user_id)
    
    try:
        while True:
            # Recebe mensagem do cliente
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                # Rate limiting por tipo de mensagem
                user_id = current_user.user_id
                
                if message_type == "chat":
                    if not ws_rate_limiter.is_allowed(user_id, "chat"):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Rate limit excedido para chat. Aguarde um momento."
                        }))
                        continue
                    
                    # Processa mensagem de chat
                    chat_message = {
                        "type": "chat",
                        "user_id": user_id,
                        "username": current_user.username,
                        "message": message_data.get("message", ""),
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    
                    # Envia para todos na mesa (todas as instâncias)
                    await websocket_manager.broadcast_to_room(table_id, json.dumps(chat_message))
                
                elif message_type == "dice_roll":
                    if not ws_rate_limiter.is_allowed(user_id, "dice_roll"):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Rate limit excedido para rolagem de dados. Aguarde um momento."
                        }))
                        continue
                    
                    # Processa rolagem de dados
                    dice_message = {
                        "type": "dice_roll",
                        "user_id": user_id,
                        "username": current_user.username,
                        "dice_data": message_data.get("dice_data", {}),
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    
                    # Envia para todos na mesa (todas as instâncias)
                    await websocket_manager.broadcast_to_room(table_id, json.dumps(dice_message))
                
                elif message_type == "update_tokens":
                    if not ws_rate_limiter.is_allowed(user_id, "update_tokens"):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Rate limit excedido para atualização de tokens. Aguarde um momento."
                        }))
                        continue
                    
                    # Processa atualização de tokens
                    token_message = {
                        "type": "update_tokens",
                        "user_id": user_id,
                        "username": current_user.username,
                        "token_data": message_data.get("token_data", {}),
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    
                    # Envia para todos na mesa (todas as instâncias)
                    await websocket_manager.broadcast_to_room(table_id, json.dumps(token_message))
                
                elif message_type == "map_updated":
                    if not ws_rate_limiter.is_allowed(user_id, "map_updated"):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Rate limit excedido para atualização de mapa. Aguarde um momento."
                        }))
                        continue
                    
                    # Processa atualização de mapa
                    map_message = {
                        "type": "map_updated",
                        "user_id": user_id,
                        "username": current_user.username,
                        "map_data": message_data.get("map_data", {}),
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    
                    # Envia para todos na mesa (todas as instâncias)
                    await websocket_manager.broadcast_to_room(table_id, json.dumps(map_message))
                
                else:
                    # Tipo de mensagem não reconhecido
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": f"Tipo de mensagem não reconhecido: {message_type}"
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Formato de mensagem inválido. Use JSON."
                }))
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Erro ao processar mensagem: {str(e)}"
                }))
                
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
        await websocket_manager.disconnect(websocket)

async def notify_map_updated(table_id: str):
    """Função auxiliar para notificar sobre mudanças no mapa (com clustering)"""
    try:
        message = {
            "type": "map_changed",
            "table_id": table_id,
            "timestamp": asyncio.get_event_loop().time()
        }
        await websocket_manager.broadcast_to_room(table_id, json.dumps(message))
    except Exception as e:
        print(f"Erro ao notificar mudança de mapa: {e}")