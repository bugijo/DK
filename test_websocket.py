#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste de WebSocket e Chat em Tempo Real
Dungeon Keeper - Sistema de Testes e Automação
"""

import asyncio
import websockets
import json
import time
from datetime import datetime

class WebSocketTester:
    def __init__(self):
        self.backend_url = "ws://127.0.0.1:8000"
        self.test_results = []
        
    def log_result(self, test_name, status, details=""):
        """Registra resultado de um teste"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {status} {test_name}: {details}")
        
    async def test_websocket_connection(self):
        """Testa conexão básica com WebSocket"""
        try:
            # Simula um token JWT válido para teste
            test_token = "test_token_123"
            uri = f"{self.backend_url}/ws/game/test_table?token={test_token}"
            
            async with websockets.connect(uri) as websocket:
                self.log_result("WebSocket Connection", "PASS", "Conexão estabelecida com sucesso")
                return True
                
        except Exception as e:
            self.log_result("WebSocket Connection", "FAIL", f"Erro: {str(e)}")
            return False
            
    async def test_chat_message(self):
        """Testa envio e recebimento de mensagens de chat"""
        try:
            test_token = "test_token_123"
            uri = f"{self.backend_url}/ws/game/test_table?token={test_token}"
            
            async with websockets.connect(uri) as websocket:
                # Envia mensagem de chat
                chat_message = {
                    "type": "chat",
                    "message": "Teste de mensagem do chat",
                    "user": "test_user"
                }
                
                await websocket.send(json.dumps(chat_message))
                
                # Aguarda resposta
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                response_data = json.loads(response)
                
                if response_data.get("type") == "chat":
                    self.log_result("Chat Message", "PASS", "Mensagem enviada e recebida")
                    return True
                else:
                    self.log_result("Chat Message", "FAIL", "Resposta inválida")
                    return False
                    
        except asyncio.TimeoutError:
            self.log_result("Chat Message", "FAIL", "Timeout na resposta")
            return False
        except Exception as e:
            self.log_result("Chat Message", "FAIL", f"Erro: {str(e)}")
            return False
            
    async def test_token_update(self):
        """Testa atualização de tokens do mapa"""
        try:
            test_token = "test_token_123"
            uri = f"{self.backend_url}/ws/game/test_table?token={test_token}"
            
            async with websockets.connect(uri) as websocket:
                # Envia atualização de token
                token_update = {
                    "type": "update_tokens",
                    "tokens": [
                        {
                            "id": "token_1",
                            "x": 100,
                            "y": 150,
                            "imageUrl": "/icons/warrior.png",
                            "size": 1,
                            "label": "Guerreiro"
                        }
                    ]
                }
                
                await websocket.send(json.dumps(token_update))
                
                # Aguarda confirmação
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                response_data = json.loads(response)
                
                if response_data.get("type") == "update_tokens":
                    self.log_result("Token Update", "PASS", "Tokens atualizados com sucesso")
                    return True
                else:
                    self.log_result("Token Update", "FAIL", "Resposta inválida")
                    return False
                    
        except asyncio.TimeoutError:
            self.log_result("Token Update", "FAIL", "Timeout na resposta")
            return False
        except Exception as e:
            self.log_result("Token Update", "FAIL", f"Erro: {str(e)}")
            return False
            
    async def test_multiple_connections(self):
        """Testa múltiplas conexões simultâneas"""
        try:
            test_token = "test_token_123"
            uri = f"{self.backend_url}/ws/game/test_table?token={test_token}"
            
            # Cria 3 conexões simultâneas
            connections = []
            for i in range(3):
                conn = await websockets.connect(uri)
                connections.append(conn)
                
            # Envia mensagem de uma conexão
            message = {
                "type": "chat",
                "message": f"Mensagem de teste múltiplo",
                "user": "test_user_1"
            }
            
            await connections[0].send(json.dumps(message))
            
            # Verifica se outras conexões recebem
            responses_received = 0
            for i, conn in enumerate(connections):
                try:
                    response = await asyncio.wait_for(conn.recv(), timeout=3.0)
                    responses_received += 1
                except asyncio.TimeoutError:
                    pass
                    
            # Fecha conexões
            for conn in connections:
                await conn.close()
                
            if responses_received >= 2:  # Pelo menos 2 conexões receberam
                self.log_result("Multiple Connections", "PASS", f"{responses_received} conexões receberam a mensagem")
                return True
            else:
                self.log_result("Multiple Connections", "FAIL", f"Apenas {responses_received} conexões receberam")
                return False
                
        except Exception as e:
            self.log_result("Multiple Connections", "FAIL", f"Erro: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Executa todos os testes de WebSocket"""
        print("🔌 === TESTE DE WEBSOCKET E CHAT ===\n")
        
        tests = [
            self.test_websocket_connection,
            self.test_chat_message,
            self.test_token_update,
            self.test_multiple_connections
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                result = await test()
                if result:
                    passed += 1
            except Exception as e:
                self.log_result(test.__name__, "ERROR", f"Erro inesperado: {str(e)}")
                
        print(f"\n📊 RESULTADOS DOS TESTES WEBSOCKET:")
        print(f"✅ Aprovados: {passed}/{total}")
        print(f"📈 Taxa de Sucesso: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 TODOS OS TESTES WEBSOCKET PASSARAM!")
        elif passed >= total * 0.8:
            print("⚠️ MAIORIA DOS TESTES PASSOU - SISTEMA FUNCIONAL")
        else:
            print("❌ MUITOS TESTES FALHARAM - VERIFICAR WEBSOCKET")
            
        return passed, total
        
async def main():
    """Função principal"""
    tester = WebSocketTester()
    await tester.run_all_tests()
    
if __name__ == "__main__":
    asyncio.run(main())