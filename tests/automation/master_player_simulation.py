#!/usr/bin/env python3
"""
Automação de Simulação Completa - Dungeon Keeper
Simula o fluxo completo de um Mestre e Jogadores usando o sistema
"""

import requests
import json
import time
import random
from typing import Dict, Any, List
from datetime import datetime

class DungeonKeeperSimulation:
    """Simulação completa do sistema Dungeon Keeper."""
    
    def __init__(self):
        self.base_url = "http://127.0.0.1:8000"
        self.frontend_url = "http://localhost:3001"
        self.session = requests.Session()
        self.users = {}
        self.tokens = {}
        self.entities = {
            'characters': [],
            'items': [],
            'monsters': [],
            'npcs': [],
            'stories': [],
            'tables': []
        }
        self.simulation_log = []
        
    def log_action(self, user_type: str, action: str, details: str = "", success: bool = True):
        """Registra uma ação da simulação."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        status = "✅" if success else "❌"
        log_entry = {
            'timestamp': timestamp,
            'user_type': user_type,
            'action': action,
            'details': details,
            'success': success
        }
        self.simulation_log.append(log_entry)
        print(f"[{timestamp}] {status} {user_type}: {action} {details}")
    
    def create_user(self, username: str, email: str, password: str, user_type: str) -> bool:
        """Cria um novo usuário."""
        user_data = {
            "username": username,
            "email": email,
            "password": password
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/register",
                json=user_data,
                timeout=10
            )
            
            if response.status_code == 201:
                self.users[username] = user_data
                self.log_action(user_type, "Cadastro", f"Usuário {username} criado com sucesso")
                return True
            elif response.status_code == 200:
                # Usuário já existe, vamos tentar fazer login
                self.users[username] = user_data
                self.log_action(user_type, "Cadastro", f"Usuário {username} já existe, tentando login")
                return True
            else:
                self.log_action(user_type, "Cadastro", f"Erro: {response.status_code}", False)
                return False
        except Exception as e:
            self.log_action(user_type, "Cadastro", f"Erro: {str(e)}", False)
            return False
    
    def login_user(self, username: str, password: str, user_type: str) -> str:
        """Faz login do usuário e retorna o token."""
        login_data = {
            "username": username,
            "password": password
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/token",
                data=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                token_data = response.json()
                token = token_data.get("access_token")
                if token:
                    self.tokens[username] = token
                    self.log_action(user_type, "Login", f"Login realizado com sucesso")
                    return token
                else:
                    self.log_action(user_type, "Login", "Token não recebido", False)
                    return None
            else:
                self.log_action(user_type, "Login", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Login", f"Erro: {str(e)}", False)
            return None
    
    def create_character(self, username: str, user_type: str) -> Dict[str, Any]:
        """Cria um personagem."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, "Criar Personagem", "Token não disponível", False)
            return None
            
        # Dados de personagens variados
        characters_data = [
            {
                "name": "Aragorn Montanha",
                "race": "Human",
                "character_class": "Ranger",
                "level": 5,
                "background": "Folk Hero",
                "alignment": "Chaotic Good",
                "strength": 16, "dexterity": 14, "constitution": 15,
                "intelligence": 12, "wisdom": 13, "charisma": 10,
                "hit_points": 45, "armor_class": 16, "speed": 30
            },
            {
                "name": "Lyra Luaverde",
                "race": "Elf",
                "character_class": "Wizard",
                "level": 3,
                "background": "Sage",
                "alignment": "Lawful Neutral",
                "strength": 8, "dexterity": 14, "constitution": 12,
                "intelligence": 16, "wisdom": 13, "charisma": 11,
                "hit_points": 18, "armor_class": 12, "speed": 30
            },
            {
                "name": "Thorin Forjaferro",
                "race": "Dwarf",
                "character_class": "Fighter",
                "level": 4,
                "background": "Soldier",
                "alignment": "Lawful Good",
                "strength": 16, "dexterity": 12, "constitution": 16,
                "intelligence": 10, "wisdom": 12, "charisma": 8,
                "hit_points": 38, "armor_class": 18, "speed": 25
            }
        ]
        
        character_data = random.choice(characters_data)
        character_data["name"] = f"{character_data['name']} de {username}"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/characters/",
                json=character_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                character = response.json()
                self.entities['characters'].append(character)
                self.log_action(user_type, "Criar Personagem", f"'{character_data['name']}' criado")
                return character
            else:
                self.log_action(user_type, "Criar Personagem", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Criar Personagem", f"Erro: {str(e)}", False)
            return None
    
    def create_item(self, username: str, user_type: str) -> Dict[str, Any]:
        """Cria um item."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, "Criar Item", "Token não disponível", False)
            return None
            
        items_data = [
            {
                "name": "Espada Longa Élfica",
                "description": "Uma espada longa forjada pelos elfos com runas mágicas",
                "type": "weapon",
                "rarity": "uncommon",
                "weight": 3.0,
                "value": 1500
            },
            {
                "name": "Poção de Cura Maior",
                "description": "Uma poção que restaura 4d4+4 pontos de vida",
                "type": "consumable",
                "rarity": "uncommon",
                "weight": 0.5,
                "value": 300
            },
            {
                "name": "Armadura de Couro Batido +1",
                "description": "Armadura de couro reforçada com proteção mágica",
                "type": "armor",
                "rarity": "uncommon",
                "weight": 10.0,
                "value": 800
            }
        ]
        
        item_data = random.choice(items_data)
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/items/",
                json=item_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                item = response.json()
                self.entities['items'].append(item)
                self.log_action(user_type, "Criar Item", f"'{item_data['name']}' criado")
                return item
            else:
                self.log_action(user_type, "Criar Item", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Criar Item", f"Erro: {str(e)}", False)
            return None
    
    def create_monster(self, username: str, user_type: str) -> Dict[str, Any]:
        """Cria um monstro."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, "Criar Monstro", "Token não disponível", False)
            return None
            
        monsters_data = [
            {
                "name": "Goblin Guerreiro",
                "size": "small",
                "type": "humanoid",
                "alignment": "Neutral Evil",
                "armor_class": 15,
                "hit_points": "7 (2d6)",
                "speed": "30 ft.",
                "strength": 8, "dexterity": 14, "constitution": 10,
                "intelligence": 10, "wisdom": 8, "charisma": 8,
                "challenge_rating": "1/4"
            },
            {
                "name": "Orc Berserker",
                "size": "medium",
                "type": "humanoid",
                "alignment": "Chaotic Evil",
                "armor_class": 13,
                "hit_points": "15 (2d8 + 2)",
                "speed": "30 ft.",
                "strength": 16, "dexterity": 12, "constitution": 13,
                "intelligence": 7, "wisdom": 11, "charisma": 10,
                "challenge_rating": "1/2"
            },
            {
                "name": "Esqueleto Guardião",
                "size": "medium",
                "type": "undead",
                "alignment": "Lawful Evil",
                "armor_class": 13,
                "hit_points": "13 (2d8 + 2)",
                "speed": "30 ft.",
                "strength": 10, "dexterity": 14, "constitution": 15,
                "intelligence": 6, "wisdom": 8, "charisma": 5,
                "challenge_rating": "1/4"
            }
        ]
        
        monster_data = random.choice(monsters_data)
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/monsters/",
                json=monster_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                monster = response.json()
                self.entities['monsters'].append(monster)
                self.log_action(user_type, "Criar Monstro", f"'{monster_data['name']}' criado")
                return monster
            else:
                self.log_action(user_type, "Criar Monstro", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Criar Monstro", f"Erro: {str(e)}", False)
            return None
    
    def create_npc(self, username: str, user_type: str) -> Dict[str, Any]:
        """Cria um NPC."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, "Criar NPC", "Token não disponível", False)
            return None
            
        npcs_data = [
            {
                "name": "Elara Comerciante",
                "race": "Human",
                "character_class": "Commoner",
                "level": 1,
                "role": "Comerciante",
                "location": "Praça do Mercado",
                "personality_traits": "Sempre sorridente e prestativa",
                "ideals": "O comércio justo beneficia a todos",
                "bonds": "Sua loja é herança de família",
                "flaws": "Confia demais nas pessoas",
                "description": "Uma comerciante de meia-idade que vende equipamentos básicos"
            },
            {
                "name": "Gareth Ferreiro",
                "race": "Dwarf",
                "character_class": "Artisan",
                "level": 3,
                "role": "Ferreiro",
                "location": "Forja da Cidade",
                "personality_traits": "Perfeccionista e orgulhoso de seu trabalho",
                "ideals": "A qualidade nunca deve ser comprometida",
                "bonds": "Seu martelo foi feito por seu avô",
                "flaws": "Teimoso e difícil de convencer",
                "description": "Um ferreiro anão especialista em armas e armaduras"
            },
            {
                "name": "Sábio Aldric",
                "race": "Elf",
                "character_class": "Wizard",
                "level": 8,
                "role": "Sábio",
                "location": "Torre dos Estudos",
                "personality_traits": "Curioso e sempre fazendo perguntas",
                "ideals": "O conhecimento deve ser preservado",
                "bonds": "Sua biblioteca é seu tesouro mais precioso",
                "flaws": "Esquece do mundo ao redor quando estuda",
                "description": "Um elfo sábio que conhece muito sobre história e magia"
            }
        ]
        
        npc_data = random.choice(npcs_data)
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/npcs/",
                json=npc_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                npc = response.json()
                self.entities['npcs'].append(npc)
                self.log_action(user_type, "Criar NPC", f"'{npc_data['name']}' criado")
                return npc
            else:
                self.log_action(user_type, "Criar NPC", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Criar NPC", f"Erro: {str(e)}", False)
            return None
    
    def create_story(self, username: str, user_type: str) -> Dict[str, Any]:
        """Cria uma história."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, "Criar História", "Token não disponível", False)
            return None
            
        stories_data = [
            {
                "title": "A Mina Perdida de Phandelver",
                "description": "Uma aventura clássica para personagens iniciantes",
                "content": "Os heróis são contratados para escoltar uma caravana até a cidade de Phandalin. No caminho, descobrem uma conspiração envolvendo goblins e um mago negro que busca controlar a região. A aventura os levará através de cavernas perigosas, ruínas antigas e confrontos épicos.",
                "tags": ["iniciante", "goblins", "mina", "tesouro"]
            },
            {
                "title": "O Mistério da Torre Sombria",
                "description": "Uma investigação sobrenatural em uma torre abandonada",
                "content": "Uma torre misteriosa apareceu durante a noite nos arredores da cidade. Os habitantes relatam luzes estranhas e sons assombrados vindos de lá. Os aventureiros devem investigar a torre, descobrir seus segredos e enfrentar as criaturas que a habitam. A torre guarda segredos de um mago que tentou transcender a morte.",
                "tags": ["mistério", "torre", "mortos-vivos", "investigação"]
            },
            {
                "title": "A Coroa do Rei Dragão",
                "description": "Uma busca épica por um artefato lendário",
                "content": "A Coroa do Rei Dragão, um artefato de poder imenso, foi roubada do tesouro real. Os heróis devem seguir pistas através de diferentes reinos, enfrentar cultistas dracônicos e finalmente confrontar um dragão ancião em sua própria fortaleza. O destino do reino depende de recuperar a coroa antes que ela seja usada para despertar dragões adormecidos.",
                "tags": ["épico", "dragão", "artefato", "reino"]
            }
        ]
        
        story_data = random.choice(stories_data)
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/stories/",
                json=story_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                story = response.json()
                self.entities['stories'].append(story)
                self.log_action(user_type, "Criar História", f"'{story_data['title']}' criada")
                return story
            else:
                self.log_action(user_type, "Criar História", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Criar História", f"Erro: {str(e)}", False)
            return None
    
    def create_table(self, username: str, user_type: str, story_id: str = None) -> Dict[str, Any]:
        """Cria uma mesa de jogo."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, "Criar Mesa", "Token não disponível", False)
            return None
            
        table_data = {
            "title": f"Mesa de {username} - Aventura Épica",
            "description": "Uma mesa de RPG D&D 5e para aventureiros corajosos",
            "max_players": 5
        }
        
        if story_id:
            table_data["story_id"] = story_id
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/tables/",
                json=table_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                table = response.json()
                self.entities['tables'].append(table)
                self.log_action(user_type, "Criar Mesa", f"'{table_data['title']}' criada")
                return table
            else:
                self.log_action(user_type, "Criar Mesa", f"Erro: {response.status_code}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Criar Mesa", f"Erro: {str(e)}", False)
            return None
    
    def simulate_master_workflow(self) -> bool:
        """Simula o fluxo completo de um Mestre."""
        print("\n🎭 === SIMULAÇÃO DO MESTRE ===")
        
        # 1. Cadastro e Login do Mestre
        master_username = f"mestre_{int(time.time())}"
        master_email = f"{master_username}@dungeon.com"
        master_password = "senha123"
        
        if not self.create_user(master_username, master_email, master_password, "MESTRE"):
            return False
            
        if not self.login_user(master_username, master_password, "MESTRE"):
            return False
        
        # 2. Criação de Entidades pelo Mestre
        time.sleep(1)
        
        # Criar múltiplos itens
        for i in range(2):
            self.create_item(master_username, "MESTRE")
            time.sleep(0.5)
        
        # Criar múltiplos monstros
        for i in range(3):
            self.create_monster(master_username, "MESTRE")
            time.sleep(0.5)
        
        # Criar múltiplos NPCs
        for i in range(2):
            self.create_npc(master_username, "MESTRE")
            time.sleep(0.5)
        
        # Criar história
        story = self.create_story(master_username, "MESTRE")
        time.sleep(1)
        
        # 3. Criar Mesa com a História
        story_id = story.get('id') if story else None
        table = self.create_table(master_username, "MESTRE", story_id)
        
        if table:
            self.log_action("MESTRE", "Fluxo Completo", "Mestre configurou tudo para a sessão")
            return True
        else:
            self.log_action("MESTRE", "Fluxo Completo", "Falha na criação da mesa", False)
            return False
    
    def simulate_player_workflow(self, player_number: int) -> bool:
        """Simula o fluxo completo de um Jogador."""
        print(f"\n🎲 === SIMULAÇÃO DO JOGADOR {player_number} ===")
        
        # 1. Cadastro e Login do Jogador
        player_username = f"jogador{player_number}_{int(time.time())}"
        player_email = f"{player_username}@aventura.com"
        player_password = "senha123"
        
        if not self.create_user(player_username, player_email, player_password, f"JOGADOR {player_number}"):
            return False
            
        if not self.login_user(player_username, player_password, f"JOGADOR {player_number}"):
            return False
        
        # 2. Criação de Entidades pelo Jogador
        time.sleep(1)
        
        # Criar personagem principal
        character = self.create_character(player_username, f"JOGADOR {player_number}")
        time.sleep(0.5)
        
        # Criar alguns itens pessoais
        self.create_item(player_username, f"JOGADOR {player_number}")
        time.sleep(0.5)
        
        # Criar uma história de background
        self.create_story(player_username, f"JOGADOR {player_number}")
        time.sleep(1)
        
        if character:
            self.log_action(f"JOGADOR {player_number}", "Fluxo Completo", "Jogador criou personagem e está pronto")
            return True
        else:
            self.log_action(f"JOGADOR {player_number}", "Fluxo Completo", "Falha na criação do personagem", False)
            return False
    
    def simulate_game_session(self) -> bool:
        """Simula uma sessão de jogo básica."""
        print("\n⚔️ === SIMULAÇÃO DE SESSÃO DE JOGO ===")
        
        if not self.entities['tables']:
            self.log_action("SESSÃO", "Iniciar Jogo", "Nenhuma mesa disponível", False)
            return False
        
        table = self.entities['tables'][0]
        table_id = table.get('id')
        
        self.log_action("SESSÃO", "Iniciar Jogo", f"Sessão iniciada na mesa '{table.get('title')}'")
        
        # Simular algumas ações de jogo
        game_actions = [
            "Mestre descreve a cena inicial",
            "Jogador 1 faz teste de Percepção",
            "Jogador 2 lança magia de detecção",
            "Mestre revela inimigos ocultos",
            "Combate iniciado - rolagem de iniciativa",
            "Jogador 1 ataca com espada",
            "Jogador 2 conjura Bola de Fogo",
            "Mestre aplica dano aos inimigos",
            "Combate finalizado - experiência distribuída",
            "Jogadores encontram tesouro"
        ]
        
        for action in game_actions:
            self.log_action("SESSÃO", "Ação de Jogo", action)
            time.sleep(0.3)
        
        self.log_action("SESSÃO", "Finalizar Jogo", "Sessão concluída com sucesso")
        return True
    
    def run_complete_simulation(self) -> Dict[str, Any]:
        """Executa a simulação completa."""
        print("🎮 INICIANDO SIMULAÇÃO COMPLETA DO DUNGEON KEEPER")
        print("="*80)
        
        start_time = time.time()
        
        # 1. Simular Mestre
        master_success = self.simulate_master_workflow()
        
        # 2. Simular Jogadores
        players_success = []
        for i in range(1, 4):  # 3 jogadores
            success = self.simulate_player_workflow(i)
            players_success.append(success)
            time.sleep(1)
        
        # 3. Simular Sessão de Jogo
        session_success = self.simulate_game_session()
        
        # 4. Gerar Relatório
        end_time = time.time()
        duration = end_time - start_time
        
        report = {
            'duration': f"{duration:.2f} segundos",
            'master_success': master_success,
            'players_success': players_success,
            'session_success': session_success,
            'total_users': len(self.users),
            'entities_created': {
                'characters': len(self.entities['characters']),
                'items': len(self.entities['items']),
                'monsters': len(self.entities['monsters']),
                'npcs': len(self.entities['npcs']),
                'stories': len(self.entities['stories']),
                'tables': len(self.entities['tables'])
            },
            'simulation_log': self.simulation_log
        }
        
        self.generate_final_report(report)
        return report
    
    def generate_final_report(self, report: Dict[str, Any]):
        """Gera o relatório final da simulação."""
        print("\n" + "="*80)
        print("🎯 RELATÓRIO FINAL DA SIMULAÇÃO")
        print("="*80)
        
        print(f"⏱️ Duração Total: {report['duration']}")
        print(f"👥 Usuários Criados: {report['total_users']}")
        
        print("\n📊 ENTIDADES CRIADAS:")
        for entity_type, count in report['entities_created'].items():
            print(f"  {entity_type.title()}: {count}")
        
        print("\n✅ RESULTADOS:")
        print(f"  Mestre: {'✅ Sucesso' if report['master_success'] else '❌ Falha'}")
        
        for i, success in enumerate(report['players_success'], 1):
            print(f"  Jogador {i}: {'✅ Sucesso' if success else '❌ Falha'}")
        
        print(f"  Sessão de Jogo: {'✅ Sucesso' if report['session_success'] else '❌ Falha'}")
        
        # Calcular taxa de sucesso
        total_tests = 1 + len(report['players_success']) + 1  # mestre + jogadores + sessão
        successful_tests = sum([
            report['master_success'],
            sum(report['players_success']),
            report['session_success']
        ])
        
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 Taxa de Sucesso: {success_rate:.1f}% ({successful_tests}/{total_tests})")
        
        print("\n🎯 STATUS FINAL:")
        if success_rate >= 90:
            print("🟢 SIMULAÇÃO EXCELENTE - SISTEMA TOTALMENTE FUNCIONAL!")
        elif success_rate >= 70:
            print("🟡 SIMULAÇÃO BOA - SISTEMA FUNCIONAL COM PEQUENOS AJUSTES")
        else:
            print("🔴 SIMULAÇÃO COM PROBLEMAS - SISTEMA REQUER CORREÇÕES")
        
        print("\n📋 LOG DETALHADO:")
        for log_entry in report['simulation_log'][-10:]:  # Últimas 10 ações
            status = "✅" if log_entry['success'] else "❌"
            print(f"  [{log_entry['timestamp']}] {status} {log_entry['user_type']}: {log_entry['action']} {log_entry['details']}")
        
        print("="*80)
        
        # Salvar relatório em arquivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"simulation_report_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório completo salvo em: {filename}")

if __name__ == "__main__":
    # Executar simulação
    simulation = DungeonKeeperSimulation()
    report = simulation.run_complete_simulation()
    
    print("\n🎮 Simulação concluída! Verifique o relatório gerado.")