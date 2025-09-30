#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste de WebSocket com Autenticação Real
Dungeon Keeper - Sistema de Testes e Automação
"""

import asyncio
import websockets
import json
import requests
from datetime import datetime

class WebSocketAuthTester:
    def __init__(self):
        self.backend_url = "ws://127.0.0.1:8000"
        self.api_url = "http://127.0.0.1:8000"
        self.test_results = []
        self.auth_token = None
        
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
        
    def get_auth_token(self):
        """Obtém um token JWT válido"""
        try:
            # Primeiro, registra um usuário de teste
            register_data = {
                "username": "test_websocket_user",
                "email": "test@websocket.com",
                "password": "testpassword123"
            }
            
            register_response = requests.post(
                f"{self.api_url}/api/v1/register",
                json=register_data
            )
            
            # Agora faz login para obter o token
            login_data = {
                "username": "test_websocket_user",
                "password": "testpassword123"
            }
            
            login_response = requests.post(
                f"{self.api_url}/api/v1/token",
                data=login_data
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                self.auth_token = token_data["access_token"]
                self.log_result("Authentication", "PASS", "Token JWT obtido com sucesso")
                return True
            else:
                self.log_result("Authentication", "FAIL", f"Erro no login: {login_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", "FAIL", f"Erro: {str(e)}")
            return False
            
    async def test_websocket_connection(self):
        """Testa conexão básica com WebSocket"""
        if not self.auth_token:
            self.log_result("WebSocket Connection", "FAIL", "Token não disponível")
            return False
            
        try:
            uri = f"{self.backend_url}/ws/game/test_table?token={self.auth_token}"
            
            async with websockets.connect(uri) as websocket:
                self.log_result("WebSocket Connection", "PASS", "Conexão estabelecida com sucesso")
                return True
                
        except Exception as e:
            self.log_result("WebSocket Connection", "FAIL", f"Erro: {str(e)}")
            return False
            
    async def test_chat_message(self):
        """Testa envio e recebimento de mensagens de chat"""
        if not self.auth_token:
            self.log_result("Chat Message", "FAIL", "Token não disponível")
            return False
            
        try:
            uri = f"{self.backend_url}/ws/game/test_table?token={self.auth_token}"
            
            async with websockets.connect(uri) as websocket:
                # Envia mensagem de chat
                chat_message = {
                    "type": "chat",
                    "message": "Teste de mensagem do chat"
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
            
    async def run_all_tests(self):
        """Executa todos os testes de WebSocket"""
        print("🔌 === TESTE DE WEBSOCKET COM AUTENTICAÇÃO ===\n")
        
        # Primeiro obtém o token
        if not self.get_auth_token():
            print("❌ FALHA NA AUTENTICAÇÃO - TESTES CANCELADOS")
            return 0, 2
        
        tests = [
            self.test_websocket_connection,
            self.test_chat_message
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
        print(f"✅ Aprovados: {passed}/{total + 1}")
        print(f"📈 Taxa de Sucesso: {(passed/(total + 1))*100:.1f}%")
        
        if passed == total:
            print("🎉 TODOS OS TESTES WEBSOCKET PASSARAM!")
        elif passed >= total * 0.5:
            print("⚠️ MAIORIA DOS TESTES PASSOU - SISTEMA FUNCIONAL")
        else:
            print("❌ MUITOS TESTES FALHARAM - VERIFICAR WEBSOCKET")
            
        return passed, total + 1
        
async def main():
    """Função principal"""
    tester = WebSocketAuthTester()
    await tester.run_all_tests()
    
if __name__ == "__main__":
    asyncio.run(main())