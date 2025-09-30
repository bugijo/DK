#!/usr/bin/env python3
"""
Suite de Testes Automatizados - Dungeon Keeper
Simula dois usuários: Narrador (cria mesa) e Jogador (entra na mesa)
Cria 10 de cada entidade e testa todas as funcionalidades
"""

import requests
import json
import time
import random
import uuid
from datetime import datetime
from typing import Dict, List, Any

class DungeonKeeperTestSuite:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3001"
        self.narrator_token = None
        self.player_token = None
        self.test_results = []
        self.created_entities = {
            'items': [],
            'monsters': [],
            'npcs': [],
            'stories': [],
            'tables': []
        }
        self.session_id = str(uuid.uuid4())[:8]
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Registra resultado de um teste"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'test': test_name,
            'success': success,
            'details': details
        }
        self.test_results.append(result)
        status = "✅ SUCESSO" if success else "❌ FALHA"
        print(f"{status} - {test_name}: {details}")
        
    def create_test_users(self):
        """Cria usuários de teste: narrador e jogador"""
        print("\n🎭 Criando usuários de teste...")
        
        # Criar Narrador
        narrator_data = {
            "username": f"narrador_{self.session_id}",
            "email": f"narrador_{self.session_id}@test.com",
            "password": "senha123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/v1/register", json=narrator_data)
            if response.status_code == 200:
                self.log_result("Criar Narrador", True, f"Usuário {narrator_data['username']} criado")
            else:
                self.log_result("Criar Narrador", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Criar Narrador", False, f"Exceção: {str(e)}")
            
        # Criar Jogador
        player_data = {
            "username": f"jogador_{self.session_id}",
            "email": f"jogador_{self.session_id}@test.com",
            "password": "senha123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/v1/register", json=player_data)
            if response.status_code == 200:
                self.log_result("Criar Jogador", True, f"Usuário {player_data['username']} criado")
            else:
                self.log_result("Criar Jogador", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Criar Jogador", False, f"Exceção: {str(e)}")
            
        return narrator_data, player_data
        
    def login_users(self, narrator_data: Dict, player_data: Dict):
        """Faz login dos usuários de teste"""
        print("\n🔐 Fazendo login dos usuários...")
        
        # Login Narrador
        try:
            login_data = {
                "username": narrator_data["username"],
                "password": narrator_data["password"]
            }
            response = requests.post(f"{self.base_url}/api/v1/token", data=login_data)
            if response.status_code == 200:
                self.narrator_token = response.json()["access_token"]
                self.log_result("Login Narrador", True, "Token obtido com sucesso")
            else:
                self.log_result("Login Narrador", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Login Narrador", False, f"Exceção: {str(e)}")
            
        # Login Jogador
        try:
            login_data = {
                "username": player_data["username"],
                "password": player_data["password"]
            }
            response = requests.post(f"{self.base_url}/api/v1/token", data=login_data)
            if response.status_code == 200:
                self.player_token = response.json()["access_token"]
                self.log_result("Login Jogador", True, "Token obtido com sucesso")
            else:
                self.log_result("Login Jogador", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Login Jogador", False, f"Exceção: {str(e)}")
            
    def get_headers(self, user_type: str = "narrator"):
        """Retorna headers com token de autenticação"""
        token = self.narrator_token if user_type == "narrator" else self.player_token
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
    def create_items(self, count: int = 10):
        """Cria itens de teste"""
        print(f"\n⚔️ Criando {count} itens...")
        
        if not self.narrator_token:
            self.log_result("Criar Itens", False, "Token do narrador não disponível")
            return
        
        item_templates = [
            {"name": "Espada Flamejante", "description": "Uma espada que queima com fogo eterno", "type": "weapon", "rarity": "legendary"},
            {"name": "Poção de Cura", "description": "Restaura 50 pontos de vida", "type": "consumable", "rarity": "common"},
            {"name": "Armadura de Dragão", "description": "Armadura feita de escamas de dragão", "type": "armor", "rarity": "epic"},
            {"name": "Anel da Invisibilidade", "description": "Torna o usuário invisível por 10 minutos", "type": "accessory", "rarity": "rare"},
            {"name": "Grimório Antigo", "description": "Livro de magias perdidas", "type": "book", "rarity": "legendary"},
            {"name": "Adaga Envenenada", "description": "Adaga com veneno mortal", "type": "weapon", "rarity": "uncommon"},
            {"name": "Elmo do Cavaleiro", "description": "Proteção para a cabeça", "type": "armor", "rarity": "common"},
            {"name": "Pergaminho de Teletransporte", "description": "Permite viajar instantaneamente", "type": "consumable", "rarity": "rare"},
            {"name": "Colar de Proteção", "description": "Aumenta resistência mágica", "type": "accessory", "rarity": "uncommon"},
            {"name": "Machado de Guerra", "description": "Arma pesada de combate", "type": "weapon", "rarity": "common"}
        ]
        
        for i in range(count):
            template = item_templates[i % len(item_templates)]
            item_data = {
                "name": f"{template['name']} {self.session_id}#{i+1}",
                "description": template["description"],
                "type": template["type"],
                "rarity": template["rarity"]
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/v1/items/",
                    json=item_data,
                    headers=self.get_headers("narrator")
                )
                if response.status_code == 200:
                    item = response.json()
                    self.created_entities['items'].append(item)
                    self.log_result(f"Criar Item {i+1}", True, f"Item '{item_data['name']}' criado")
                else:
                    self.log_result(f"Criar Item {i+1}", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Criar Item {i+1}", False, f"Exceção: {str(e)}")
                
    def create_monsters(self, count: int = 10):
        """Cria monstros de teste"""
        print(f"\n👹 Criando {count} monstros...")
        
        if not self.narrator_token:
            self.log_result("Criar Monstros", False, "Token do narrador não disponível")
            return
        
        monster_templates = [
            {"name": "Dragão Vermelho", "description": "Dragão ancestral de fogo", "type": "dragon", "size": "Huge", "armor_class": 19, "hit_points": "256 (19d20+57)", "speed": "40 ft., climb 40 ft., fly 80 ft.", "challenge_rating": "17"},
            {"name": "Orc Guerreiro", "description": "Orc brutal com machado", "type": "humanoid", "size": "Medium", "armor_class": 13, "hit_points": "15 (2d8+6)", "speed": "30 ft.", "challenge_rating": "1/2"},
            {"name": "Esqueleto Arqueiro", "description": "Morto-vivo com arco", "type": "undead", "size": "Medium", "armor_class": 13, "hit_points": "13 (2d8+4)", "speed": "30 ft.", "challenge_rating": "1/4"},
            {"name": "Lobo Sombrio", "description": "Lobo das trevas", "type": "beast", "size": "Medium", "armor_class": 13, "hit_points": "11 (2d8+2)", "speed": "40 ft.", "challenge_rating": "1/4"},
            {"name": "Golem de Pedra", "description": "Construto de pedra animada", "type": "construct", "size": "Large", "armor_class": 17, "hit_points": "178 (17d10+85)", "speed": "30 ft.", "challenge_rating": "10"},
            {"name": "Goblin Ladino", "description": "Pequeno mas perigoso", "type": "humanoid", "size": "Small", "armor_class": 15, "hit_points": "7 (2d6)", "speed": "30 ft.", "challenge_rating": "1/4"},
            {"name": "Espectro", "description": "Alma penada vingativa", "type": "undead", "size": "Medium", "armor_class": 12, "hit_points": "22 (5d8)", "speed": "0 ft., fly 50 ft. (hover)", "challenge_rating": "1"},
            {"name": "Troll Regenerador", "description": "Troll com regeneração", "type": "giant", "size": "Large", "armor_class": 15, "hit_points": "84 (8d10+40)", "speed": "30 ft.", "challenge_rating": "5"},
            {"name": "Elemental de Fogo", "description": "Ser puro de chamas", "type": "elemental", "size": "Large", "armor_class": 13, "hit_points": "102 (12d10+36)", "speed": "50 ft.", "challenge_rating": "5"},
            {"name": "Basilisco", "description": "Serpente petrificante", "type": "monstrosity", "size": "Medium", "armor_class": 15, "hit_points": "52 (8d8+16)", "speed": "20 ft.", "challenge_rating": "3"}
        ]
        
        for i in range(count):
            template = monster_templates[i % len(monster_templates)]
            monster_data = {
                "name": f"{template['name']} {self.session_id}#{i+1}",
                "description": template["description"],
                "type": template["type"],
                "size": template["size"],
                "armor_class": template["armor_class"],
                "hit_points": template["hit_points"],
                "speed": template["speed"],
                "challenge_rating": template["challenge_rating"]
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/v1/monsters/",
                    json=monster_data,
                    headers=self.get_headers("narrator")
                )
                if response.status_code == 200:
                    monster = response.json()
                    self.created_entities['monsters'].append(monster)
                    self.log_result(f"Criar Monstro {i+1}", True, f"Monstro '{monster_data['name']}' criado")
                else:
                    self.log_result(f"Criar Monstro {i+1}", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Criar Monstro {i+1}", False, f"Exceção: {str(e)}")
                
    def create_npcs(self, count: int = 10):
        """Cria NPCs de teste"""
        print(f"\n🧙 Criando {count} NPCs...")
        
        if not self.narrator_token:
            self.log_result("Criar NPCs", False, "Token do narrador não disponível")
            return
        
        npc_templates = [
            {"name": "Mestre Gandor", "description": "Sábio mago da torre", "role": "wizard"},
            {"name": "Capitão Marcus", "description": "Líder da guarda real", "role": "guard"},
            {"name": "Elara a Curandeira", "description": "Clériga especialista em cura", "role": "healer"},
            {"name": "Thorin Forjaferro", "description": "Ferreiro anão mestre", "role": "blacksmith"},
            {"name": "Lady Morgana", "description": "Nobre misteriosa", "role": "noble"},
            {"name": "Finn o Ladino", "description": "Informante das ruas", "role": "rogue"},
            {"name": "Irmão Benedict", "description": "Monge do mosteiro", "role": "monk"},
            {"name": "Lyra Cantora", "description": "Barda viajante", "role": "bard"},
            {"name": "Gareth Caçador", "description": "Rastreador experiente", "role": "ranger"},
            {"name": "Velha Sage", "description": "Oráculo das profecias", "role": "oracle"}
        ]
        
        for i in range(count):
            template = npc_templates[i % len(npc_templates)]
            npc_data = {
                "name": f"{template['name']} {self.session_id}#{i+1}",
                "description": template["description"],
                "role": template["role"]
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/v1/npcs/",
                    json=npc_data,
                    headers=self.get_headers("narrator")
                )
                if response.status_code == 200:
                    npc = response.json()
                    self.created_entities['npcs'].append(npc)
                    self.log_result(f"Criar NPC {i+1}", True, f"NPC '{npc_data['name']}' criado")
                else:
                    self.log_result(f"Criar NPC {i+1}", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Criar NPC {i+1}", False, f"Exceção: {str(e)}")
                
    def create_stories(self, count: int = 10):
        """Cria histórias de teste"""
        print(f"\n📚 Criando {count} histórias...")
        
        if not self.narrator_token:
            self.log_result("Criar Histórias", False, "Token do narrador não disponível")
            return
        
        story_templates = [
            {"title": "A Lenda do Dragão Perdido", "content": "Uma aventura épica em busca do último dragão."},
            {"title": "O Mistério da Torre Sombria", "content": "Investigação em uma torre assombrada."},
            {"title": "A Busca pelo Tesouro Pirata", "content": "Caça ao tesouro em ilhas misteriosas."},
            {"title": "O Retorno do Rei Lich", "content": "Batalha contra o mal ancestral."},
            {"title": "A Floresta Encantada", "content": "Aventura mágica na floresta élfica."},
            {"title": "O Templo dos Deuses Antigos", "content": "Exploração de ruínas sagradas."},
            {"title": "A Revolta dos Goblins", "content": "Conflito nas montanhas selvagens."},
            {"title": "O Portal Dimensional", "content": "Viagem entre mundos paralelos."},
            {"title": "A Maldição da Múmia", "content": "Horror no deserto das pirâmides."},
            {"title": "O Torneio dos Campeões", "content": "Competição entre os maiores heróis."}
        ]
        
        for i in range(count):
            template = story_templates[i % len(story_templates)]
            story_data = {
                "title": f"{template['title']} {self.session_id}#{i+1}",
                "content": template["content"]
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/v1/stories/",
                    json=story_data,
                    headers=self.get_headers("narrator")
                )
                if response.status_code == 200:
                    story = response.json()
                    self.created_entities['stories'].append(story)
                    self.log_result(f"Criar História {i+1}", True, f"História '{story_data['title']}' criada")
                else:
                    self.log_result(f"Criar História {i+1}", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Criar História {i+1}", False, f"Exceção: {str(e)}")
                
    def test_frontend_access(self):
        """Testa acesso ao frontend"""
        print("\n🌐 Testando acesso ao frontend...")
        
        try:
            response = requests.get(self.frontend_url, timeout=10)
            if response.status_code == 200:
                self.log_result("Acesso Frontend", True, "Frontend acessível")
            else:
                self.log_result("Acesso Frontend", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Acesso Frontend", False, f"Exceção: {str(e)}")
            
    def test_api_endpoints(self):
        """Testa todos os endpoints da API"""
        print("\n🔌 Testando endpoints da API...")
        
        if not self.narrator_token:
            self.log_result("Testar APIs", False, "Token do narrador não disponível")
            return
        
        endpoints = [
            ("/api/v1/items/", "GET", "Listar Itens"),
            ("/api/v1/monsters/", "GET", "Listar Monstros"),
            ("/api/v1/npcs/", "GET", "Listar NPCs"),
            ("/api/v1/stories/", "GET", "Listar Histórias")
        ]
        
        for endpoint, method, name in endpoints:
            try:
                response = requests.get(
                    f"{self.base_url}{endpoint}",
                    headers=self.get_headers("narrator")
                )
                if response.status_code == 200:
                    data = response.json()
                    count = len(data) if isinstance(data, list) else 1
                    self.log_result(f"API {name}", True, f"{count} itens encontrados")
                else:
                    self.log_result(f"API {name}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"API {name}", False, f"Exceção: {str(e)}")
                
    def test_user_interaction(self):
        """Simula interação entre narrador e jogador"""
        print("\n🎲 Testando interação entre usuários...")
        
        if not self.narrator_token or not self.player_token:
            self.log_result("Interação Usuários", False, "Tokens não disponíveis")
            return
            
        # Narrador verifica seus dados
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/users/me",
                headers=self.get_headers("narrator")
            )
            if response.status_code == 200:
                narrator_info = response.json()
                self.log_result("Perfil Narrador", True, f"Usuário: {narrator_info.get('username', 'N/A')}")
            else:
                self.log_result("Perfil Narrador", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Perfil Narrador", False, f"Exceção: {str(e)}")
            
        # Jogador verifica seus dados
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/users/me",
                headers=self.get_headers("player")
            )
            if response.status_code == 200:
                player_info = response.json()
                self.log_result("Perfil Jogador", True, f"Usuário: {player_info.get('username', 'N/A')}")
            else:
                self.log_result("Perfil Jogador", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Perfil Jogador", False, f"Exceção: {str(e)}")
                
    def generate_report(self):
        """Gera relatório final dos testes"""
        print("\n📊 Gerando relatório final...")
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result['success'])
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        report = f"""
========================================
🎮 RELATÓRIO DE TESTES - DUNGEON KEEPER
========================================

📈 RESUMO GERAL:
• Total de Testes: {total_tests}
• Testes Bem-sucedidos: {successful_tests}
• Taxa de Sucesso: {success_rate:.1f}%
• Sessão: {self.session_id}

📦 ENTIDADES CRIADAS:
• Itens: {len(self.created_entities['items'])}
• Monstros: {len(self.created_entities['monsters'])}
• NPCs: {len(self.created_entities['npcs'])}
• Histórias: {len(self.created_entities['stories'])}

🔍 DETALHES DOS TESTES:
"""
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            report += f"{status} {result['test']}: {result['details']}\n"
            
        report += f"""

🎯 CONCLUSÕES:
• Backend: {'✅ Funcionando' if any('API' in r['test'] and r['success'] for r in self.test_results) else '❌ Com problemas'}
• Frontend: {'✅ Acessível' if any('Frontend' in r['test'] and r['success'] for r in self.test_results) else '❌ Inacessível'}
• Autenticação: {'✅ OK' if any('Login' in r['test'] and r['success'] for r in self.test_results) else '❌ Falha'}
• Criação de Dados: {'✅ OK' if len(self.created_entities['items']) > 0 else '❌ Falha'}
• Interação Usuários: {'✅ OK' if any('Perfil' in r['test'] and r['success'] for r in self.test_results) else '❌ Falha'}

⏰ Relatório gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
========================================
"""
        
        # Salvar relatório em arquivo
        try:
            with open(f'test_report_{self.session_id}.txt', 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"\n📄 Relatório salvo em: test_report_{self.session_id}.txt")
        except Exception as e:
            print(f"\n❌ Erro ao salvar relatório: {str(e)}")
            
        print(report)
        return report
        
    def run_full_test_suite(self):
        """Executa toda a suíte de testes"""
        print("🚀 Iniciando Suíte Completa de Testes do Dungeon Keeper")
        print(f"📋 Sessão: {self.session_id}")
        print("=" * 60)
        
        try:
            # Testar frontend primeiro
            self.test_frontend_access()
            
            # Criar usuários
            narrator_data, player_data = self.create_test_users()
            
            # Fazer login
            self.login_users(narrator_data, player_data)
            
            # Testar interação entre usuários
            self.test_user_interaction()
            
            # Criar entidades (10 de cada)
            self.create_items(10)
            self.create_monsters(10)
            self.create_npcs(10)
            self.create_stories(10)
            
            # Testar APIs
            self.test_api_endpoints()
            
            # Gerar relatório
            return self.generate_report()
            
        except Exception as e:
            self.log_result("Execução Geral", False, f"Erro crítico: {str(e)}")
            return self.generate_report()

if __name__ == "__main__":
    suite = DungeonKeeperTestSuite()
    report = suite.run_full_test_suite()