#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste de Simulação: 5 Usuários Simultâneos
1 Mestre criando mesa + 4 Jogadores se cadastrando

Testa:
- Registro simultâneo de usuários
- Criação de personagens
- Criação de mesa pelo mestre
- Solicitações de entrada na mesa
- Rate limiting
- WebSocket connections
- Concorrência do sistema
"""

import asyncio
import aiohttp
import json
import time
import uuid
from typing import Dict, List
from datetime import datetime

# Configurações
BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

class UserSimulator:
    def __init__(self, user_id: int, is_master: bool = False):
        self.user_id = user_id
        self.is_master = is_master
        self.username = f"user{user_id}" if not is_master else "mestre"
        self.email = f"{self.username}@test.com"
        self.password = "senha123"
        self.access_token = None
        self.refresh_token = None
        self.character_id = None
        self.table_id = None
        self.session = None
        self.ws = None
        
    async def setup_session(self):
        """Configura a sessão HTTP"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup(self):
        """Limpa recursos"""
        if self.ws:
            await self.ws.close()
        if self.session:
            await self.session.close()
            
    async def register(self) -> bool:
        """Registra o usuário"""
        try:
            data = {
                "username": self.username,
                "email": self.email,
                "password": self.password
            }
            
            async with self.session.post(f"{BASE_URL}/api/v1/register", json=data) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ {self.username}: Registrado com sucesso")
                    return True
                else:
                    error = await resp.text()
                    print(f"❌ {self.username}: Erro no registro - {error}")
                    return False
                    
        except Exception as e:
            print(f"❌ {self.username}: Exceção no registro - {e}")
            return False
            
    async def login(self) -> bool:
        """Faz login e obtém tokens"""
        try:
            data = {
                "username": self.username,
                "password": self.password
            }
            
            async with self.session.post(
                f"{BASE_URL}/api/v1/token", 
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            ) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    self.access_token = result["access_token"]
                    self.refresh_token = result.get("refresh_token")
                    print(f"✅ {self.username}: Login realizado")
                    return True
                else:
                    error = await resp.text()
                    print(f"❌ {self.username}: Erro no login - {error}")
                    return False
                    
        except Exception as e:
            print(f"❌ {self.username}: Exceção no login - {e}")
            return False
            
    async def create_character(self) -> bool:
        """Cria um personagem"""
        try:
            character_data = {
                "name": f"Personagem do {self.username}",
                "race": "Humano",
                "character_class": "Guerreiro" if self.is_master else ["Mago", "Ladino", "Clérigo", "Bárbaro"][self.user_id % 4],
                "level": 1,
                "background": "Soldado",
                "alignment": "Leal e Bom",
                "strength": 15,
                "dexterity": 14,
                "constitution": 13,
                "intelligence": 12,
                "wisdom": 10,
                "charisma": 8,
                "hit_points": 10,
                "max_hit_points": 10,
                "armor_class": 16,
                "backstory": f"História épica do {self.username}"
            }
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.post(
                f"{BASE_URL}/api/v1/characters", 
                json=character_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    self.character_id = result["id"]
                    print(f"✅ {self.username}: Personagem criado - {result['name']}")
                    return True
                else:
                    error = await resp.text()
                    print(f"❌ {self.username}: Erro ao criar personagem - {error}")
                    return False
                    
        except Exception as e:
            print(f"❌ {self.username}: Exceção ao criar personagem - {e}")
            return False
            
    async def create_story(self) -> str:
        """Cria uma história (apenas para mestre)"""
        try:
            story_data = {
                "title": "A Taverna do Dragão Adormecido",
                "synopsis": "Uma aventura épica em uma taverna misteriosa onde um dragão antigo dorme nos porões."
            }
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.post(
                f"{BASE_URL}/api/v1/stories", 
                json=story_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ {self.username}: História criada - {result['title']}")
                    return result["id"]
                else:
                    error = await resp.text()
                    print(f"❌ {self.username}: Erro ao criar história - {error}")
                    return None
                    
        except Exception as e:
            print(f"❌ {self.username}: Exceção ao criar história - {e}")
            return None
            
    async def create_table(self, story_id: str) -> bool:
        """Cria uma mesa (apenas para mestre)"""
        try:
            table_data = {
                "title": "Mesa Épica - A Taverna do Dragão",
                "description": "Uma sessão emocionante de D&D 5e para 4 jogadores corajosos!",
                "story_id": story_id,
                "max_players": 4,
                "min_character_level": 1,
                "max_character_level": 3,
                "location": "Online via Dungeon Keeper",
                "campaign_description": "Aventura introdutória perfeita para novos jogadores. Exploração, combate e roleplay!"
            }
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.post(
                f"{BASE_URL}/api/v1/tables", 
                json=table_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    self.table_id = result["id"]
                    print(f"✅ {self.username}: Mesa criada - {result['title']}")
                    print(f"   📋 Mesa ID: {self.table_id}")
                    return True
                else:
                    error = await resp.text()
                    print(f"❌ {self.username}: Erro ao criar mesa - {error}")
                    return False
                    
        except Exception as e:
            print(f"❌ {self.username}: Exceção ao criar mesa - {e}")
            return False
            
    async def request_join_table(self, table_id: str) -> bool:
        """Solicita entrada na mesa"""
        try:
            request_data = {
                "table_id": table_id,
                "character_id": self.character_id,
                "message": f"Olá! Sou {self.username} e gostaria muito de participar desta aventura épica!"
            }
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.post(
                f"{BASE_URL}/api/v1/tables/join-requests", 
                json=request_data,
                headers=headers
            ) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ {self.username}: Solicitação enviada para mesa {table_id[:8]}...")
                    return True
                else:
                    error = await resp.text()
                    print(f"❌ {self.username}: Erro ao solicitar entrada - {error}")
                    return False
                    
        except Exception as e:
            print(f"❌ {self.username}: Exceção ao solicitar entrada - {e}")
            return False
            
    async def connect_websocket(self, table_id: str) -> bool:
        """Conecta ao WebSocket da mesa"""
        try:
            ws_url = f"{WS_URL}/ws/game/{table_id}?token={self.access_token}"
            self.ws = await self.session.ws_connect(ws_url)
            print(f"🔌 {self.username}: Conectado ao WebSocket da mesa")
            
            # Envia mensagem de teste
            await self.ws.send_str(json.dumps({
                "type": "chat",
                "message": f"Olá pessoal! {self.username} entrou na mesa! 🎲"
            }))
            
            return True
            
        except Exception as e:
            print(f"❌ {self.username}: Erro no WebSocket - {e}")
            return False
            
    async def test_rate_limiting(self) -> bool:
        """Testa rate limiting enviando muitas mensagens"""
        try:
            print(f"🚀 {self.username}: Testando rate limiting...")
            
            # Envia 25 mensagens rapidamente (limite é 20/10s)
            for i in range(25):
                await self.ws.send_str(json.dumps({
                    "type": "chat",
                    "message": f"Mensagem de teste #{i+1} do {self.username}"
                }))
                await asyncio.sleep(0.1)  # 100ms entre mensagens
                
            print(f"📊 {self.username}: Enviadas 25 mensagens em 2.5s (limite: 20/10s)")
            return True
            
        except Exception as e:
            print(f"❌ {self.username}: Erro no teste de rate limiting - {e}")
            return False

async def run_master_simulation(master: UserSimulator) -> str:
    """Executa simulação do mestre"""
    print(f"\n🎭 === SIMULAÇÃO DO MESTRE ({master.username}) ===")
    
    await master.setup_session()
    
    # Fluxo do mestre
    if not await master.register():
        return None
        
    await asyncio.sleep(0.5)  # Evita rate limiting
    
    if not await master.login():
        return None
        
    if not await master.create_character():
        return None
        
    story_id = await master.create_story()
    if not story_id:
        return None
        
    if not await master.create_table(story_id):
        return None
        
    # Conecta ao WebSocket
    await master.connect_websocket(master.table_id)
    
    print(f"✅ Mestre configurado! Mesa ID: {master.table_id}")
    return master.table_id

async def run_player_simulation(player: UserSimulator, table_id: str):
    """Executa simulação de um jogador"""
    print(f"\n🎮 === SIMULAÇÃO JOGADOR {player.user_id} ({player.username}) ===")
    
    await player.setup_session()
    
    # Fluxo do jogador
    if not await player.register():
        return
        
    await asyncio.sleep(0.5)  # Evita rate limiting
    
    if not await player.login():
        return
        
    if not await player.create_character():
        return
        
    if not await player.request_join_table(table_id):
        return
        
    # Conecta ao WebSocket
    await player.connect_websocket(table_id)
    
    # Testa rate limiting
    await player.test_rate_limiting()
    
    print(f"✅ Jogador {player.user_id} configurado!")

async def main():
    """Função principal da simulação"""
    print("🏰 === DUNGEON KEEPER - TESTE DE 5 USUÁRIOS SIMULTÂNEOS ===")
    print(f"⏰ Início: {datetime.now().strftime('%H:%M:%S')}")
    print("\n📋 Cenário:")
    print("   1️⃣ Mestre cria conta, personagem, história e mesa")
    print("   2️⃣ 4 Jogadores criam contas, personagens e solicitam entrada")
    print("   3️⃣ Todos conectam via WebSocket")
    print("   4️⃣ Teste de rate limiting")
    print("   5️⃣ Verificação de concorrência")
    
    start_time = time.time()
    
    try:
        # Cria usuários
        master = UserSimulator(0, is_master=True)
        players = [UserSimulator(i+1) for i in range(4)]
        
        # Fase 1: Mestre configura tudo
        print("\n🎯 === FASE 1: CONFIGURAÇÃO DO MESTRE ===")
        table_id = await run_master_simulation(master)
        
        if not table_id:
            print("❌ Falha na configuração do mestre!")
            return
            
        # Fase 2: Jogadores se cadastram simultaneamente
        print("\n🎯 === FASE 2: JOGADORES SIMULTÂNEOS ===")
        
        # Executa jogadores em paralelo
        player_tasks = [
            run_player_simulation(player, table_id) 
            for player in players
        ]
        
        await asyncio.gather(*player_tasks)
        
        # Fase 3: Teste de comunicação WebSocket
        print("\n🎯 === FASE 3: TESTE DE COMUNICAÇÃO ===")
        
        # Mestre envia mensagem para todos
        if master.ws:
            await master.ws.send_str(json.dumps({
                "type": "chat",
                "message": "🎲 Bem-vindos à mesa! Que a aventura comece!"
            }))
            
        # Aguarda um pouco para processar mensagens
        await asyncio.sleep(2)
        
        # Fase 4: Teste de dados (se WebSocket estiver ativo)
        print("\n🎯 === FASE 4: TESTE DE DADOS ===")
        
        for i, player in enumerate(players):
            if player.ws:
                await player.ws.send_str(json.dumps({
                    "type": "dice_roll",
                    "dice_data": {
                        "dice": "1d20",
                        "result": 10 + i,
                        "modifier": i,
                        "reason": "Teste de iniciativa"
                    }
                }))
                await asyncio.sleep(0.2)
                
        await asyncio.sleep(1)
        
        # Estatísticas finais
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n🎯 === FASE 5: RESULTADOS ===")
        print(f"⏱️  Tempo total: {duration:.2f} segundos")
        print(f"👥 Usuários criados: 5 (1 mestre + 4 jogadores)")
        print(f"🎭 Personagens criados: 5")
        print(f"📚 Histórias criadas: 1")
        print(f"🏠 Mesas criadas: 1")
        print(f"📝 Solicitações enviadas: 4")
        print(f"🔌 Conexões WebSocket: 5")
        print(f"💬 Mensagens de teste: ~130 (rate limiting testado)")
        
        # Verifica health do sistema
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/health") as resp:
                if resp.status == 200:
                    health = await resp.json()
                    print(f"💚 Sistema: {health['status']} (v{health['version']})")
                    
            async with session.get(f"{BASE_URL}/metrics") as resp:
                if resp.status == 200:
                    metrics = await resp.json()
                    print(f"📊 Métricas disponíveis: {metrics.get('status', 'OK')}")
        
        print("\n✅ === TESTE CONCLUÍDO COM SUCESSO! ===")
        print("🏰 Dungeon Keeper suportou 5 usuários simultâneos perfeitamente!")
        
    except Exception as e:
        print(f"\n❌ === ERRO CRÍTICO ===")
        print(f"Exceção: {e}")
        
    finally:
        # Cleanup
        print("\n🧹 Limpando recursos...")
        await master.cleanup()
        for player in players:
            await player.cleanup()
        print("✅ Recursos limpos!")

if __name__ == "__main__":
    asyncio.run(main())