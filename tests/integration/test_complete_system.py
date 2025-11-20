#!/usr/bin/env python3
"""
Teste de Integração Completa - Dungeon Keeper
Verifica se todos os sistemas estão funcionando corretamente
"""

import os
import time
from typing import Dict, Any

import pytest

RUN_INTEGRATION = os.getenv("RUN_INTEGRATION_TESTS")

try:
    import requests
except ImportError:  # pragma: no cover - dependency availability is environment specific
    requests = None


if not RUN_INTEGRATION or requests is None:
    reason = "Integration tests desativados" if not RUN_INTEGRATION else "Pacote requests indisponível"
    pytest.skip(reason, allow_module_level=True)

import json

class CompleteSystemTest:
    """Teste completo do sistema Dungeon Keeper."""
    
    def __init__(self):
        self.base_url = "http://127.0.0.1:8000"
        self.frontend_url = "http://localhost:3001"
        self.test_results = []
        self.tokens = {}
        
    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Registra o resultado de um teste."""
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": time.time()
        })
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
    
    def test_backend_health(self):
        """Testa se o backend está funcionando."""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                self.log_result("Backend Health", True, "Backend respondendo")
                return True
            else:
                self.log_result("Backend Health", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Backend Health", False, f"Erro: {str(e)}")
            return False
    
    def test_frontend_health(self):
        """Testa se o frontend está funcionando."""
        try:
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                self.log_result("Frontend Health", True, "Frontend respondendo")
                return True
            else:
                self.log_result("Frontend Health", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Frontend Health", False, f"Erro: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Testa o registro de usuário."""
        user_data = {
            "username": f"test_user_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "test123456"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/register",
                json=user_data,
                timeout=10
            )
            
            if response.status_code == 201:
                self.log_result("User Registration", True, f"Usuário {user_data['username']} criado")
                return user_data
            else:
                self.log_result("User Registration", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_result("User Registration", False, f"Erro: {str(e)}")
            return None
    
    def test_user_login(self, user_data: Dict[str, str]):
        """Testa o login do usuário."""
        if not user_data:
            self.log_result("User Login", False, "Dados de usuário não disponíveis")
            return None
            
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/token",
                data=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                token_data = response.json()
                token = token_data.get("access_token")
                if token:
                    self.tokens[user_data["username"]] = token
                    self.log_result("User Login", True, f"Login realizado para {user_data['username']}")
                    return token
                else:
                    self.log_result("User Login", False, "Token não recebido")
                    return None
            else:
                self.log_result("User Login", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_result("User Login", False, f"Erro: {str(e)}")
            return None
    
    def test_api_endpoints(self, token: str):
        """Testa os principais endpoints da API."""
        if not token:
            self.log_result("API Endpoints", False, "Token não disponível")
            return
            
        headers = {"Authorization": f"Bearer {token}"}
        
        endpoints = [
            ("/api/v1/users/me", "GET", "User Profile"),
            ("/api/v1/characters/", "GET", "Characters List"),
            ("/api/v1/items/", "GET", "Items List"),
            ("/api/v1/monsters/", "GET", "Monsters List"),
            ("/api/v1/npcs/", "GET", "NPCs List"),
            ("/api/v1/stories/", "GET", "Stories List"),
            ("/api/v1/tables/", "GET", "Tables List")
        ]
        
        for endpoint, method, name in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", headers=headers, timeout=5)
                if response.status_code == 200:
                    self.log_result(f"API {name}", True, "Endpoint funcionando")
                else:
                    self.log_result(f"API {name}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"API {name}", False, f"Erro: {str(e)}")
    
    def test_character_creation(self, token: str):
        """Testa a criação de personagem."""
        if not token:
            self.log_result("Character Creation", False, "Token não disponível")
            return None
            
        character_data = {
            "name": "Aragorn Teste",
            "race": "Human",
            "character_class": "Ranger",
            "level": 5,
            "background": "Folk Hero",
            "alignment": "Chaotic Good",
            "strength": 16,
            "dexterity": 14,
            "constitution": 15,
            "intelligence": 12,
            "wisdom": 13,
            "charisma": 10,
            "hit_points": 45,
            "armor_class": 16,
            "speed": 30
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/characters/",
                json=character_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                character = response.json()
                self.log_result("Character Creation", True, f"Personagem '{character_data['name']}' criado")
                return character
            else:
                self.log_result("Character Creation", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_result("Character Creation", False, f"Erro: {str(e)}")
            return None
    
    def test_table_creation(self, token: str):
        """Testa a criação de mesa."""
        if not token:
            self.log_result("Table Creation", False, "Token não disponível")
            return None
            
        table_data = {
            "title": "Mesa de Teste Completo",
            "description": "Mesa criada durante teste de integração",
            "max_players": 5
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/tables/",
                json=table_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                table = response.json()
                self.log_result("Table Creation", True, f"Mesa '{table_data['title']}' criada")
                return table
            else:
                self.log_result("Table Creation", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_result("Table Creation", False, f"Erro: {str(e)}")
            return None
    
    def test_dnd5e_systems(self):
        """Testa os sistemas D&D 5e implementados."""
        try:
            # Testa importação das classes D&D 5e
            from src.systems.character.dnd5e_classes import DND5E_CLASSES, CharacterClass
            from src.systems.character.dnd5e_races import DND5E_RACES, Race
            
            # Verifica se as classes estão implementadas
            expected_classes = [CharacterClass.FIGHTER, CharacterClass.WIZARD, CharacterClass.ROGUE, CharacterClass.CLERIC]
            for char_class in expected_classes:
                if char_class in DND5E_CLASSES:
                    self.log_result(f"D&D 5e Class {char_class.value}", True, "Classe implementada")
                else:
                    self.log_result(f"D&D 5e Class {char_class.value}", False, "Classe não encontrada")
            
            # Verifica se as raças estão implementadas
            expected_races = [Race.HUMAN, Race.ELF, Race.DWARF, Race.HALFLING]
            for race in expected_races:
                if race in DND5E_RACES:
                    self.log_result(f"D&D 5e Race {race.value}", True, "Raça implementada")
                else:
                    self.log_result(f"D&D 5e Race {race.value}", False, "Raça não encontrada")
                    
        except ImportError as e:
            self.log_result("D&D 5e Systems", False, f"Erro de importação: {str(e)}")
        except Exception as e:
            self.log_result("D&D 5e Systems", False, f"Erro: {str(e)}")
    
    def test_magic_system(self):
        """Testa o sistema de magia."""
        try:
            # Executa os testes de magia
            import subprocess
            result = subprocess.run(
                ["python", "-m", "pytest", "tests/systems/magic/test_spell_system.py", "-v"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.log_result("Magic System Tests", True, "Todos os testes de magia passaram")
            else:
                self.log_result("Magic System Tests", False, f"Testes falharam: {result.stderr}")
                
        except Exception as e:
            self.log_result("Magic System Tests", False, f"Erro: {str(e)}")
    
    def test_audio_system(self):
        """Testa se o sistema de áudio foi implementado."""
        try:
            # Verifica se os arquivos de áudio existem
            import os
            audio_files = [
                "frontend/src/services/audioManager.ts",
                "frontend/src/components/AudioSettings.tsx"
            ]
            
            for file_path in audio_files:
                if os.path.exists(file_path):
                    self.log_result(f"Audio File {file_path}", True, "Arquivo existe")
                else:
                    self.log_result(f"Audio File {file_path}", False, "Arquivo não encontrado")
                    
        except Exception as e:
            self.log_result("Audio System", False, f"Erro: {str(e)}")
    
    def test_visual_effects_system(self):
        """Testa se o sistema de efeitos visuais foi implementado."""
        try:
            # Verifica se os arquivos de efeitos visuais existem
            import os
            visual_files = [
                "frontend/src/components/VisualEffects.tsx",
                "frontend/src/components/VisualEffects.css"
            ]
            
            for file_path in visual_files:
                if os.path.exists(file_path):
                    self.log_result(f"Visual Effects File {file_path}", True, "Arquivo existe")
                else:
                    self.log_result(f"Visual Effects File {file_path}", False, "Arquivo não encontrado")
                    
        except Exception as e:
            self.log_result("Visual Effects System", False, f"Erro: {str(e)}")
    
    def test_documentation(self):
        """Testa se a documentação está completa."""
        try:
            import os
            doc_files = [
                "docs/reference/guia-mestre-dnd5e.md",
                "docs/reference/livro-jogador-dnd5e.md",
                "docs/api/openapi-spec.yaml"
            ]
            
            for file_path in doc_files:
                if os.path.exists(file_path):
                    self.log_result(f"Documentation {file_path}", True, "Documentação existe")
                else:
                    self.log_result(f"Documentation {file_path}", False, "Documentação não encontrada")
                    
        except Exception as e:
            self.log_result("Documentation", False, f"Erro: {str(e)}")
    
    def generate_final_report(self):
        """Gera relatório final dos testes."""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "="*80)
        print("🎮 RELATÓRIO FINAL - TESTE COMPLETO DO SISTEMA")
        print("="*80)
        print(f"📊 Total de Testes: {total_tests}")
        print(f"✅ Testes Aprovados: {passed_tests}")
        print(f"❌ Testes Falhados: {failed_tests}")
        print(f"📈 Taxa de Sucesso: {success_rate:.1f}%")
        print("\n📋 RESUMO POR CATEGORIA:")
        
        categories = {}
        for result in self.test_results:
            category = result['test'].split()[0]
            if category not in categories:
                categories[category] = {'passed': 0, 'failed': 0}
            
            if result['success']:
                categories[category]['passed'] += 1
            else:
                categories[category]['failed'] += 1
        
        for category, stats in categories.items():
            total_cat = stats['passed'] + stats['failed']
            rate = (stats['passed'] / total_cat * 100) if total_cat > 0 else 0
            print(f"  {category}: {stats['passed']}/{total_cat} ({rate:.1f}%)")
        
        print("\n🎯 STATUS FINAL:")
        if success_rate >= 95:
            print("🟢 SISTEMA COMPLETO E PRONTO PARA PRODUÇÃO!")
        elif success_rate >= 80:
            print("🟡 SISTEMA FUNCIONAL COM PEQUENOS AJUSTES NECESSÁRIOS")
        else:
            print("🔴 SISTEMA REQUER CORREÇÕES ANTES DO USO")
        
        print("="*80)
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': success_rate,
            'categories': categories,
            'ready_for_production': success_rate >= 95
        }
    
    def run_complete_test_suite(self):
        """Executa todos os testes do sistema."""
        print("🚀 Iniciando Teste Completo do Sistema Dungeon Keeper")
        print("="*80)
        
        # Testes de infraestrutura
        backend_ok = self.test_backend_health()
        frontend_ok = self.test_frontend_health()
        
        if not backend_ok:
            print("⚠️ Backend não está funcionando. Alguns testes serão pulados.")
        
        if not frontend_ok:
            print("⚠️ Frontend não está funcionando. Alguns testes serão pulados.")
        
        # Testes de funcionalidade (apenas se backend estiver funcionando)
        if backend_ok:
            user_data = self.test_user_registration()
            token = self.test_user_login(user_data) if user_data else None
            
            if token:
                self.test_api_endpoints(token)
                self.test_character_creation(token)
                self.test_table_creation(token)
        
        # Testes de sistemas implementados
        self.test_dnd5e_systems()
        self.test_magic_system()
        self.test_audio_system()
        self.test_visual_effects_system()
        self.test_documentation()
        
        # Gera relatório final
        return self.generate_final_report()

if __name__ == "__main__":
    test_suite = CompleteSystemTest()
    report = test_suite.run_complete_test_suite()
    
    # Salva relatório em arquivo
    import json
    with open(f"test_report_{int(time.time())}.json", "w") as f:
        json.dump({
            'report': report,
            'detailed_results': test_suite.test_results
        }, f, indent=2)
    
    print(f"\n📄 Relatório detalhado salvo em test_report_{int(time.time())}.json")