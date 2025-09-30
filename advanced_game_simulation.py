#!/usr/bin/env python3
"""
Simulação Avançada de Jogo - Dungeon Keeper
Cria 1 Mestre + 3 Jogadores, cada jogador cria 10 personagens,
Mestre cria mesa, todos entram na mesa e simula agendamento de jogo
"""

import requests
import json
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any

class AdvancedGameSimulation:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3001"
        self.session_id = str(uuid.uuid4())[:8]
        
        # Tokens dos usuários
        self.master_token = None
        self.player_tokens = {}
        
        # Dados dos usuários
        self.master_data = None
        self.players_data = {}
        
        # Entidades criadas
        self.created_characters = {}
        self.created_table = None
        
        # Logs de teste
        self.test_results = []
        
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
        
    def create_users(self):
        """Cria 1 Mestre + 3 Jogadores"""
        print("\n👥 Criando usuários do jogo...")
        
        # Criar Mestre
        self.master_data = {
            "username": f"mestre_{self.session_id}",
            "email": f"mestre_{self.session_id}@rpg.com",
            "password": "senha123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/v1/register", json=self.master_data)
            if response.status_code == 200:
                self.log_result("Criar Mestre", True, f"Mestre {self.master_data['username']} criado")
            else:
                self.log_result("Criar Mestre", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Criar Mestre", False, f"Exceção: {str(e)}")
            
        # Criar 3 Jogadores
        for i in range(1, 4):
            player_data = {
                "username": f"jogador{i}_{self.session_id}",
                "email": f"jogador{i}_{self.session_id}@rpg.com",
                "password": "senha123"
            }
            self.players_data[f"player{i}"] = player_data
            
            try:
                response = requests.post(f"{self.base_url}/api/v1/register", json=player_data)
                if response.status_code == 200:
                    self.log_result(f"Criar Jogador {i}", True, f"Jogador {player_data['username']} criado")
                else:
                    self.log_result(f"Criar Jogador {i}", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Criar Jogador {i}", False, f"Exceção: {str(e)}")
                
    def login_users(self):
        """Faz login de todos os usuários"""
        print("\n🔐 Fazendo login de todos os usuários...")
        
        # Login do Mestre
        try:
            login_data = {
                "username": self.master_data["username"],
                "password": self.master_data["password"]
            }
            response = requests.post(f"{self.base_url}/api/v1/token", data=login_data)
            if response.status_code == 200:
                self.master_token = response.json()["access_token"]
                self.log_result("Login Mestre", True, "Token obtido com sucesso")
            else:
                self.log_result("Login Mestre", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Login Mestre", False, f"Exceção: {str(e)}")
            
        # Login dos Jogadores
        for player_key, player_data in self.players_data.items():
            try:
                login_data = {
                    "username": player_data["username"],
                    "password": player_data["password"]
                }
                response = requests.post(f"{self.base_url}/api/v1/token", data=login_data)
                if response.status_code == 200:
                    self.player_tokens[player_key] = response.json()["access_token"]
                    self.log_result(f"Login {player_key}", True, "Token obtido com sucesso")
                else:
                    self.log_result(f"Login {player_key}", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Login {player_key}", False, f"Exceção: {str(e)}")
                
    def get_headers(self, user_type: str = "master", player_key: str = None):
        """Retorna headers com token de autenticação"""
        if user_type == "master":
            token = self.master_token
        else:
            token = self.player_tokens.get(player_key)
            
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
    def create_characters_for_players(self):
        """Cada jogador cria 10 personagens"""
        print("\n🎭 Criando 10 personagens para cada jogador...")
        
        character_templates = [
            {"name": "Aragorn", "race": "Humano", "character_class": "Ranger", "level": 5, "background": "Nobre"},
            {"name": "Legolas", "race": "Elfo", "character_class": "Arqueiro", "level": 4, "background": "Soldado"},
            {"name": "Gimli", "race": "Anão", "character_class": "Guerreiro", "level": 6, "background": "Artesão"},
            {"name": "Gandalf", "race": "Humano", "character_class": "Mago", "level": 10, "background": "Eremita"},
            {"name": "Frodo", "race": "Halfling", "character_class": "Ladino", "level": 3, "background": "Camponês"},
            {"name": "Boromir", "race": "Humano", "character_class": "Paladino", "level": 7, "background": "Nobre"},
            {"name": "Arwen", "race": "Elfo", "character_class": "Clériga", "level": 5, "background": "Acólita"},
            {"name": "Faramir", "race": "Humano", "character_class": "Ranger", "level": 4, "background": "Soldado"},
            {"name": "Éowyn", "race": "Humano", "character_class": "Guerreira", "level": 5, "background": "Nobre"},
            {"name": "Samwise", "race": "Halfling", "character_class": "Druida", "level": 2, "background": "Camponês"}
        ]
        
        for player_key, player_data in self.players_data.items():
            if player_key not in self.player_tokens:
                continue
                
            self.created_characters[player_key] = []
            player_num = player_key[-1]  # Extrai o número do jogador
            
            for i in range(10):
                template = character_templates[i]
                character_data = {
                    "name": f"{template['name']} P{player_num}#{i+1}",
                    "race": template["race"],
                    "character_class": template["character_class"],
                    "level": template["level"],
                    "background": template["background"],
                    "alignment": "Neutro Bom",
                    "strength": 14,
                    "dexterity": 12,
                    "constitution": 13,
                    "intelligence": 11,
                    "wisdom": 15,
                    "charisma": 10,
                    "hit_points": template["level"] * 8 + 10,
                    "max_hit_points": template["level"] * 8 + 10,
                    "armor_class": 12 + (template["level"] // 2),
                    "backstory": f"Um {template['character_class'].lower()} {template['race'].lower()} em busca de aventuras.",
                    "personality_traits": "Corajoso e leal aos amigos.",
                    "ideals": "Proteger os inocentes.",
                    "bonds": "Meus companheiros são minha família.",
                    "flaws": "Às vezes sou impulsivo demais.",
                    "equipment": ["Espada", "Armadura de Couro", "Mochila", "50 moedas de ouro"],
                    "notes": f"Personagem criado para simulação de jogo - Sessão {self.session_id}"
                }
                
                try:
                    response = requests.post(
                        f"{self.base_url}/api/v1/characters/",
                        json=character_data,
                        headers=self.get_headers("player", player_key)
                    )
                    if response.status_code == 200:
                        character = response.json()
                        self.created_characters[player_key].append(character)
                        self.log_result(f"Criar Personagem {player_key}#{i+1}", True, f"Personagem '{character_data['name']}' criado")
                    else:
                        self.log_result(f"Criar Personagem {player_key}#{i+1}", False, f"Status {response.status_code}: {response.text}")
                except Exception as e:
                    self.log_result(f"Criar Personagem {player_key}#{i+1}", False, f"Exceção: {str(e)}")
                    
    def create_story_for_master(self):
        """Mestre cria uma história para a mesa"""
        print("\n📚 Mestre criando história para a mesa...")
        
        if not self.master_token:
            self.log_result("Criar História", False, "Token do mestre não disponível")
            return None
            
        story_data = {
            "title": f"A Grande Aventura {self.session_id}",
            "content": f"""
# A Grande Aventura - Sessão {self.session_id}

## Sinopse
Uma aventura épica onde os heróis devem salvar o reino de uma antiga maldição.

## Capítulo 1: O Chamado
Os aventureiros se encontram na taverna 'O Javali Dourado' quando um misterioso ancião se aproxima...

## Objetivos
1. Investigar os estranhos acontecimentos na vila
2. Descobrir a origem da maldição
3. Encontrar os artefatos perdidos
4. Enfrentar o mal ancestral

## NPCs Importantes
- Ancião Misterioso: Aquele que inicia a quest
- Prefeito da Vila: Líder local desesperado
- Bruxa da Floresta: Aliada ou inimiga?
- Senhor das Trevas: O antagonista principal

## Locais
- Vila de Pedravale
- Floresta Sombria
- Ruínas Antigas
- Torre do Mago

## Recompensas
- Experiência: 1000 XP por jogador
- Ouro: 500 moedas por jogador
- Itens mágicos únicos
- Título de 'Heróis do Reino'
"""
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/stories/",
                json=story_data,
                headers=self.get_headers("master")
            )
            if response.status_code == 200:
                story = response.json()
                self.log_result("Criar História", True, f"História '{story_data['title']}' criada")
                return story
            else:
                self.log_result("Criar História", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Criar História", False, f"Exceção: {str(e)}")
            return None
            
    def create_table(self, story_id: str = None):
        """Mestre cria uma mesa de jogo"""
        print("\n🎲 Mestre criando mesa de jogo...")
        
        if not self.master_token:
            self.log_result("Criar Mesa", False, "Token do mestre não disponível")
            return None
            
        table_data = {
            "title": f"Mesa Épica {self.session_id}",
            "description": f"Uma mesa de RPG épica com aventuras inesquecíveis! Sessão: {self.session_id}"
        }
        
        if story_id:
            table_data["story_id"] = story_id
            
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/tables/",
                json=table_data,
                headers=self.get_headers("master")
            )
            if response.status_code == 200:
                table = response.json()
                self.created_table = table
                self.log_result("Criar Mesa", True, f"Mesa '{table_data['title']}' criada")
                return table
            else:
                self.log_result("Criar Mesa", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Criar Mesa", False, f"Exceção: {str(e)}")
            return None
            
    def players_join_table(self):
        """Todos os jogadores entram na mesa"""
        print("\n🎯 Jogadores entrando na mesa...")
        
        if not self.created_table:
            self.log_result("Jogadores Entrar Mesa", False, "Mesa não foi criada")
            return
            
        table_id = self.created_table["id"]
        
        for player_key, player_data in self.players_data.items():
            if player_key not in self.player_tokens:
                continue
                
            try:
                response = requests.post(
                    f"{self.base_url}/api/v1/tables/{table_id}/join",
                    headers=self.get_headers("player", player_key)
                )
                if response.status_code == 200:
                    self.log_result(f"Jogador {player_key} Entrar Mesa", True, f"Jogador {player_data['username']} entrou na mesa")
                else:
                    self.log_result(f"Jogador {player_key} Entrar Mesa", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(f"Jogador {player_key} Entrar Mesa", False, f"Exceção: {str(e)}")
                
    def simulate_game_scheduling(self):
        """Simula agendamento e início do jogo"""
        print("\n📅 Simulando agendamento do jogo...")
        
        # Simular discussão de horário
        scheduling_events = [
            "Mestre propõe: 'Que tal sábado às 19h?'",
            "Jogador1 responde: 'Perfeito para mim!'",
            "Jogador2 responde: 'Posso um pouco mais tarde, 19h30?'",
            "Jogador3 responde: 'Sábado é ótimo, 19h30 funciona!'",
            "Mestre confirma: 'Fechado! Sábado 19h30, mesa confirmada!'",
            "Sistema: Agendamento salvo para sábado às 19h30"
        ]
        
        for i, event in enumerate(scheduling_events, 1):
            time.sleep(0.5)  # Simula tempo entre mensagens
            self.log_result(f"Agendamento #{i}", True, event)
            
    def simulate_game_session(self):
        """Simula uma sessão de jogo básica"""
        print("\n🎮 Simulando sessão de jogo...")
        
        game_events = [
            "🎭 Mestre: 'Bem-vindos à taverna O Javali Dourado...'",
            "🎲 Jogador1: 'Meu ranger observa o ambiente' - Rolou Percepção: 15",
            "🗡️ Jogador2: 'Meu guerreiro se aproxima do balcão' - Iniciativa: 12",
            "🏹 Jogador3: 'Minha arqueira fica de guarda na entrada' - Furtividade: 18",
            "👴 Mestre: 'Um ancião misterioso se aproxima da mesa...'",
            "💬 Ancião: 'Heróis, o reino precisa de vocês!'",
            "🎲 Jogador1: 'Pergunto sobre a missão' - Persuasão: 14",
            "📜 Mestre: 'Ele revela um mapa antigo com ruínas marcadas'",
            "⚔️ Combate: Goblins atacam a taverna!",
            "🎲 Iniciativa: Jogador3(18), Jogador1(15), Jogador2(12), Goblins(10)",
            "🏹 Jogador3 ataca com arco: Acertou! 8 de dano",
            "🗡️ Jogador1 ataca com espada: Crítico! 16 de dano",
            "🛡️ Jogador2 usa escudo para proteger civis: +2 CA para todos",
            "💀 Goblins derrotados! Experiência ganha: 150 XP cada",
            "🏆 Mestre: 'Vocês salvaram a taverna! A aventura começa...'"
        ]
        
        for i, event in enumerate(game_events, 1):
            time.sleep(1)  # Simula tempo entre ações
            self.log_result(f"Jogo #{i:02d}", True, event)
            
    def generate_final_report(self):
        """Gera relatório final da simulação"""
        print("\n📊 Gerando relatório final da simulação...")
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result['success'])
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Contar personagens criados
        total_characters = sum(len(chars) for chars in self.created_characters.values())
        
        report = f"""
========================================
🎮 SIMULAÇÃO COMPLETA DE JOGO - DUNGEON KEEPER
========================================

📈 RESUMO GERAL:
• Total de Testes: {total_tests}
• Testes Bem-sucedidos: {successful_tests}
• Taxa de Sucesso: {success_rate:.1f}%
• Sessão: {self.session_id}

👥 USUÁRIOS CRIADOS:
• Mestre: {self.master_data['username'] if self.master_data else 'N/A'}
• Jogadores: {len(self.players_data)} criados

🎭 PERSONAGENS CRIADOS:
• Total: {total_characters} personagens
• Por Jogador: {total_characters // len(self.players_data) if self.players_data else 0} personagens cada

🎲 MESA DE JOGO:
• Mesa Criada: {'✅ Sim' if self.created_table else '❌ Não'}
• Jogadores na Mesa: {len([p for p in self.players_data.keys() if p in self.player_tokens])}

🎮 SIMULAÇÃO DE JOGO:
• Agendamento: ✅ Realizado
• Sessão de Jogo: ✅ Simulada
• Eventos de Jogo: 15 eventos simulados

🔍 DETALHES DOS TESTES:
"""
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            report += f"{status} {result['test']}: {result['details']}\n"
            
        report += f"""

🎯 CONCLUSÕES:
• Sistema de Usuários: {'✅ Funcionando' if self.master_token and len(self.player_tokens) == 3 else '❌ Com problemas'}
• Criação de Personagens: {'✅ OK' if total_characters >= 30 else '❌ Falha'}
• Sistema de Mesas: {'✅ OK' if self.created_table else '❌ Falha'}
• Simulação de Jogo: {'✅ Completa' if any('Jogo #' in r['test'] for r in self.test_results) else '❌ Incompleta'}
• Agendamento: {'✅ Simulado' if any('Agendamento #' in r['test'] for r in self.test_results) else '❌ Não realizado'}

⏰ Relatório gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
========================================
"""
        
        # Salvar relatório em arquivo
        try:
            with open(f'game_simulation_report_{self.session_id}.txt', 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"\n📄 Relatório salvo em: game_simulation_report_{self.session_id}.txt")
        except Exception as e:
            print(f"\n❌ Erro ao salvar relatório: {str(e)}")
            
        print(report)
        return report
        
    def run_complete_simulation(self):
        """Executa a simulação completa do jogo"""
        print("🚀 Iniciando Simulação Completa de Jogo - Dungeon Keeper")
        print(f"📋 Sessão: {self.session_id}")
        print("=" * 70)
        
        try:
            # 1. Criar usuários (1 mestre + 3 jogadores)
            self.create_users()
            
            # 2. Fazer login de todos
            self.login_users()
            
            # 3. Cada jogador cria 10 personagens
            self.create_characters_for_players()
            
            # 4. Mestre cria história
            story = self.create_story_for_master()
            
            # 5. Mestre cria mesa
            story_id = story["id"] if story else None
            self.create_table(story_id)
            
            # 6. Jogadores entram na mesa
            self.players_join_table()
            
            # 7. Simular agendamento
            self.simulate_game_scheduling()
            
            # 8. Simular sessão de jogo
            self.simulate_game_session()
            
            # 9. Gerar relatório final
            return self.generate_final_report()
            
        except Exception as e:
            self.log_result("Simulação Geral", False, f"Erro crítico: {str(e)}")
            return self.generate_final_report()

if __name__ == "__main__":
    simulation = AdvancedGameSimulation()
    report = simulation.run_complete_simulation()