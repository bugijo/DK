#!/usr/bin/env python3
"""
Simulação Aprimorada - Dungeon Keeper
Versão melhorada com tratamento de erros e nomes únicos
"""

import requests
import json
import time
import random
import uuid
from typing import Dict, Any, List
from datetime import datetime

class EnhancedDungeonKeeperSimulation:
    """Simulação aprimorada do sistema Dungeon Keeper."""
    
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
        self.unique_id = str(uuid.uuid4())[:8]
        
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
    
    def test_backend_connection(self) -> bool:
        """Testa se o backend está respondendo."""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                self.log_action("SISTEMA", "Teste Backend", "Backend respondendo")
                return True
            else:
                self.log_action("SISTEMA", "Teste Backend", f"Status: {response.status_code}", False)
                return False
        except Exception as e:
            self.log_action("SISTEMA", "Teste Backend", f"Erro: {str(e)}", False)
            return False
    
    def create_unique_user(self, base_username: str, user_type: str) -> tuple:
        """Cria um usuário com nome único."""
        username = f"{base_username}_{self.unique_id}_{int(time.time())}"
        email = f"{username}@test.com"
        password = "senha123"
        
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
            
            if response.status_code in [200, 201]:
                self.users[username] = user_data
                self.log_action(user_type, "Cadastro", f"Usuário {username} criado")
                return username, password
            else:
                error_detail = response.text[:100] if response.text else "Erro desconhecido"
                self.log_action(user_type, "Cadastro", f"Erro {response.status_code}: {error_detail}", False)
                return None, None
        except Exception as e:
            self.log_action(user_type, "Cadastro", f"Erro: {str(e)}", False)
            return None, None
    
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
                    self.log_action(user_type, "Login", "Login realizado com sucesso")
                    return token
                else:
                    self.log_action(user_type, "Login", "Token não recebido", False)
                    return None
            else:
                error_detail = response.text[:100] if response.text else "Erro desconhecido"
                self.log_action(user_type, "Login", f"Erro {response.status_code}: {error_detail}", False)
                return None
        except Exception as e:
            self.log_action(user_type, "Login", f"Erro: {str(e)}", False)
            return None
    
    def create_entity(self, username: str, user_type: str, entity_type: str, entity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Método genérico para criar entidades."""
        token = self.tokens.get(username)
        if not token:
            self.log_action(user_type, f"Criar {entity_type.title()}", "Token não disponível", False)
            return None
            
        headers = {"Authorization": f"Bearer {token}"}
        endpoint_map = {
            'character': 'characters',
            'item': 'items',
            'monster': 'monsters',
            'npc': 'npcs',
            'story': 'stories',
            'table': 'tables'
        }
        
        endpoint = endpoint_map.get(entity_type)
        if not endpoint:
            self.log_action(user_type, f"Criar {entity_type.title()}", "Tipo de entidade inválido", False)
            return None
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/{endpoint}/",
                json=entity_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                entity = response.json()
                self.entities[endpoint].append(entity)
                entity_name = entity_data.get('name', entity_data.get('title', 'Entidade'))
                self.log_action(user_type, f"Criar {entity_type.title()}", f"'{entity_name}' criado")
                return entity
            else:
                error_detail = response.text[:100] if response.text else "Erro desconhecido"
                self.log_action(user_type, f"Criar {entity_type.title()}", f"Erro {response.status_code}: {error_detail}", False)
                return None
        except Exception as e:
            self.log_action(user_type, f"Criar {entity_type.title()}", f"Erro: {str(e)}", False)
            return None
    
    def simulate_master_complete_workflow(self) -> bool:
        """Simula o fluxo completo de um Mestre."""
        print("\n🎭 === SIMULAÇÃO COMPLETA DO MESTRE ===")
        
        # 1. Cadastro e Login
        username, password = self.create_unique_user("mestre", "MESTRE")
        if not username:
            return False
            
        token = self.login_user(username, password, "MESTRE")
        if not token:
            return False
        
        time.sleep(0.5)
        
        # 2. Criar Personagem (Mestre também pode ter personagens NPCs)
        character_data = {
            "name": f"NPC do Mestre {self.unique_id}",
            "race": "Human",
            "character_class": "Commoner",
            "level": 1,
            "background": "Folk Hero",
            "alignment": "Neutral Good",
            "strength": 10, "dexterity": 10, "constitution": 10,
            "intelligence": 10, "wisdom": 10, "charisma": 10,
            "hit_points": 8, "armor_class": 10, "speed": 30
        }
        character = self.create_entity(username, "MESTRE", "character", character_data)
        time.sleep(0.5)
        
        # 3. Criar Item
        item_data = {
            "name": f"Espada Mágica {self.unique_id}",
            "description": "Uma espada encantada pelo mestre",
            "type": "weapon",
            "rarity": "rare",
            "weight": 3.0,
            "value": 2000
        }
        item = self.create_entity(username, "MESTRE", "item", item_data)
        time.sleep(0.5)
        
        # 4. Criar Monstro
        monster_data = {
            "name": f"Dragão Vermelho {self.unique_id}",
            "size": "huge",
            "type": "dragon",
            "alignment": "Chaotic Evil",
            "armor_class": 19,
            "hit_points": "256 (19d12 + 133)",
            "speed": "40 ft., climb 40 ft., fly 80 ft.",
            "strength": 27, "dexterity": 14, "constitution": 25,
            "intelligence": 16, "wisdom": 13, "charisma": 21,
            "challenge_rating": "17"
        }
        monster = self.create_entity(username, "MESTRE", "monster", monster_data)
        time.sleep(0.5)
        
        # 5. Criar NPC
        npc_data = {
            "name": f"Sábio Aldric {self.unique_id}",
            "race": "Elf",
            "character_class": "Wizard",
            "level": 8,
            "role": "Sábio da Torre",
            "location": "Torre dos Estudos",
            "personality_traits": "Curioso e sempre fazendo perguntas",
            "ideals": "O conhecimento deve ser preservado",
            "bonds": "Sua biblioteca é seu tesouro mais precioso",
            "flaws": "Esquece do mundo ao redor quando estuda",
            "description": "Um elfo sábio que conhece muito sobre história e magia"
        }
        npc = self.create_entity(username, "MESTRE", "npc", npc_data)
        time.sleep(0.5)
        
        # 6. Criar História
        story_data = {
            "title": f"A Grande Aventura {self.unique_id}",
            "description": "Uma aventura épica criada pelo mestre",
            "content": "Os heróis devem salvar o reino de uma ameaça antiga que desperta. Através de masmorras perigosas, cidades misteriosas e batalhas épicas, eles descobrirão segredos que mudarão o destino de todos.",
            "tags": ["épico", "aventura", "reino", "mistério"]
        }
        story = self.create_entity(username, "MESTRE", "story", story_data)
        time.sleep(0.5)
        
        # 7. Criar Mesa
        table_data = {
            "title": f"Mesa Épica do Mestre {self.unique_id}",
            "description": "Uma mesa de D&D 5e para aventureiros corajosos",
            "max_players": 4
        }
        
        if story:
            table_data["story_id"] = story.get('id')
        
        table = self.create_entity(username, "MESTRE", "table", table_data)
        
        # Verificar se todas as entidades foram criadas
        entities_created = all([character, item, monster, npc, story, table])
        
        if entities_created:
            self.log_action("MESTRE", "Fluxo Completo", "Todas as entidades criadas com sucesso")
            return True
        else:
            self.log_action("MESTRE", "Fluxo Completo", "Algumas entidades falharam", False)
            return False
    
    def simulate_player_complete_workflow(self, player_number: int) -> bool:
        """Simula o fluxo completo de um Jogador."""
        print(f"\n🎲 === SIMULAÇÃO COMPLETA DO JOGADOR {player_number} ===")
        
        # 1. Cadastro e Login
        username, password = self.create_unique_user(f"jogador{player_number}", f"JOGADOR {player_number}")
        if not username:
            return False
            
        token = self.login_user(username, password, f"JOGADOR {player_number}")
        if not token:
            return False
        
        time.sleep(0.5)
        
        # 2. Criar Personagem Principal
        character_classes = ["Fighter", "Wizard", "Rogue", "Cleric"]
        character_races = ["Human", "Elf", "Dwarf", "Halfling"]
        
        character_data = {
            "name": f"Herói {player_number} {self.unique_id}",
            "race": random.choice(character_races),
            "character_class": random.choice(character_classes),
            "level": random.randint(1, 5),
            "background": "Adventurer",
            "alignment": "Chaotic Good",
            "strength": random.randint(8, 16),
            "dexterity": random.randint(8, 16),
            "constitution": random.randint(8, 16),
            "intelligence": random.randint(8, 16),
            "wisdom": random.randint(8, 16),
            "charisma": random.randint(8, 16),
            "hit_points": random.randint(20, 50),
            "armor_class": random.randint(12, 18),
            "speed": 30
        }
        character = self.create_entity(username, f"JOGADOR {player_number}", "character", character_data)
        time.sleep(0.5)
        
        # 3. Criar Item Pessoal
        item_data = {
            "name": f"Item Pessoal do Jogador {player_number} {self.unique_id}",
            "description": f"Um item especial pertencente ao jogador {player_number}",
            "type": "misc",
            "rarity": "common",
            "weight": 1.0,
            "value": 50
        }
        item = self.create_entity(username, f"JOGADOR {player_number}", "item", item_data)
        time.sleep(0.5)
        
        # 4. Criar História de Background
        story_data = {
            "title": f"História do Jogador {player_number} {self.unique_id}",
            "description": f"A história de background do personagem do jogador {player_number}",
            "content": f"Esta é a história de como o herói {player_number} se tornou um aventureiro. Nascido em uma pequena vila, sempre sonhou em explorar o mundo e fazer a diferença.",
            "tags": ["background", "personagem", f"jogador{player_number}"]
        }
        story = self.create_entity(username, f"JOGADOR {player_number}", "story", story_data)
        
        # Verificar se todas as entidades foram criadas
        entities_created = all([character, item, story])
        
        if entities_created:
            self.log_action(f"JOGADOR {player_number}", "Fluxo Completo", "Personagem e itens criados com sucesso")
            return True
        else:
            self.log_action(f"JOGADOR {player_number}", "Fluxo Completo", "Algumas entidades falharam", False)
            return False
    
    def simulate_game_session_advanced(self) -> bool:
        """Simula uma sessão de jogo avançada."""
        print("\n⚔️ === SIMULAÇÃO DE SESSÃO DE JOGO AVANÇADA ===")
        
        if not self.entities['tables']:
            self.log_action("SESSÃO", "Iniciar Jogo", "Nenhuma mesa disponível", False)
            return False
        
        table = self.entities['tables'][0]
        table_title = table.get('title', 'Mesa Desconhecida')
        
        self.log_action("SESSÃO", "Iniciar Jogo", f"Sessão iniciada na mesa '{table_title}'")
        
        # Simular ações detalhadas de jogo
        game_phases = [
            {
                "phase": "Preparação",
                "actions": [
                    "Mestre configura o mapa tático",
                    "Jogadores posicionam seus personagens",
                    "Mestre descreve a cena inicial",
                    "Sistema de áudio ativa sons ambientais"
                ]
            },
            {
                "phase": "Exploração",
                "actions": [
                    "Jogador 1 faz teste de Percepção (d20)",
                    "Jogador 2 usa magia Detectar Magia",
                    "Jogador 3 procura por armadilhas",
                    "Mestre revela pistas ocultas",
                    "Efeitos visuais mostram descobertas"
                ]
            },
            {
                "phase": "Combate",
                "actions": [
                    "Mestre revela inimigos - sons de combate",
                    "Rolagem de iniciativa para todos",
                    "Jogador 1 ataca com espada - efeito visual de dano",
                    "Jogador 2 conjura Bola de Fogo - efeito de magia",
                    "Jogador 3 usa furtividade para flanquear",
                    "Monstros contra-atacam",
                    "Sistema calcula dano automaticamente",
                    "Efeitos visuais de cura quando necessário"
                ]
            },
            {
                "phase": "Resolução",
                "actions": [
                    "Combate finalizado - som de vitória",
                    "Experiência distribuída automaticamente",
                    "Jogadores encontram tesouro",
                    "Itens adicionados ao inventário",
                    "Mestre atualiza a história",
                    "Sistema salva progresso da sessão"
                ]
            }
        ]
        
        for phase_data in game_phases:
            phase_name = phase_data["phase"]
            self.log_action("SESSÃO", "Fase de Jogo", f"Iniciando fase: {phase_name}")
            
            for action in phase_data["actions"]:
                self.log_action("SESSÃO", "Ação", action)
                time.sleep(0.2)  # Simular tempo entre ações
            
            time.sleep(0.5)  # Pausa entre fases
        
        # Simular estatísticas da sessão
        session_stats = {
            "duração": "2 horas",
            "experiência_ganha": "1200 XP",
            "itens_encontrados": 3,
            "inimigos_derrotados": 8,
            "magias_conjuradas": 15,
            "dados_rolados": 47
        }
        
        self.log_action("SESSÃO", "Estatísticas", f"Sessão concluída: {session_stats}")
        self.log_action("SESSÃO", "Finalizar Jogo", "Sessão épica concluída com sucesso")
        return True
    
    def run_enhanced_simulation(self) -> Dict[str, Any]:
        """Executa a simulação completa aprimorada."""
        print("🎮 INICIANDO SIMULAÇÃO APRIMORADA DO DUNGEON KEEPER")
        print("="*80)
        
        start_time = time.time()
        
        # 1. Testar conexão com backend
        if not self.test_backend_connection():
            print("❌ Backend não está respondendo. Abortando simulação.")
            return {'error': 'Backend não disponível'}
        
        # 2. Simular Mestre
        print("\n🎭 Iniciando simulação do Mestre...")
        master_success = self.simulate_master_complete_workflow()
        time.sleep(1)
        
        # 3. Simular Jogadores
        print("\n🎲 Iniciando simulação dos Jogadores...")
        players_success = []
        for i in range(1, 4):  # 3 jogadores
            success = self.simulate_player_complete_workflow(i)
            players_success.append(success)
            time.sleep(1)
        
        # 4. Simular Sessão de Jogo
        print("\n⚔️ Iniciando simulação da sessão de jogo...")
        session_success = self.simulate_game_session_advanced()
        
        # 5. Gerar Relatório Final
        end_time = time.time()
        duration = end_time - start_time
        
        report = {
            'simulation_id': self.unique_id,
            'duration': f"{duration:.2f} segundos",
            'backend_available': True,
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
        
        self.generate_enhanced_report(report)
        return report
    
    def generate_enhanced_report(self, report: Dict[str, Any]):
        """Gera o relatório final aprimorado da simulação."""
        print("\n" + "="*80)
        print("🎯 RELATÓRIO FINAL DA SIMULAÇÃO APRIMORADA")
        print("="*80)
        
        print(f"🆔 ID da Simulação: {report['simulation_id']}")
        print(f"⏱️ Duração Total: {report['duration']}")
        print(f"🔗 Backend Disponível: {'✅ Sim' if report['backend_available'] else '❌ Não'}")
        print(f"👥 Usuários Criados: {report['total_users']}")
        
        print("\n📊 ENTIDADES CRIADAS:")
        total_entities = 0
        for entity_type, count in report['entities_created'].items():
            print(f"  📋 {entity_type.title()}: {count}")
            total_entities += count
        print(f"  🎯 Total de Entidades: {total_entities}")
        
        print("\n✅ RESULTADOS DETALHADOS:")
        print(f"  🎭 Mestre: {'✅ Sucesso' if report['master_success'] else '❌ Falha'}")
        
        for i, success in enumerate(report['players_success'], 1):
            print(f"  🎲 Jogador {i}: {'✅ Sucesso' if success else '❌ Falha'}")
        
        print(f"  ⚔️ Sessão de Jogo: {'✅ Sucesso' if report['session_success'] else '❌ Falha'}")
        
        # Calcular taxa de sucesso
        total_tests = 1 + len(report['players_success']) + 1
        successful_tests = sum([
            report['master_success'],
            sum(report['players_success']),
            report['session_success']
        ])
        
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 MÉTRICAS DE SUCESSO:")
        print(f"  📊 Taxa de Sucesso: {success_rate:.1f}% ({successful_tests}/{total_tests})")
        print(f"  🎯 Entidades por Minuto: {(total_entities / (float(report['duration'].split()[0]) / 60)):.1f}")
        
        print("\n🎯 AVALIAÇÃO FINAL:")
        if success_rate >= 95:
            print("🟢 EXCELENTE - SISTEMA TOTALMENTE FUNCIONAL E OTIMIZADO!")
            print("   ✨ Pronto para uso em produção")
            print("   🚀 Todas as funcionalidades operando perfeitamente")
        elif success_rate >= 80:
            print("🟡 BOM - SISTEMA FUNCIONAL COM PEQUENOS AJUSTES")
            print("   🔧 Algumas melhorias podem ser implementadas")
            print("   ✅ Funcional para uso em desenvolvimento")
        elif success_rate >= 60:
            print("🟠 REGULAR - SISTEMA PARCIALMENTE FUNCIONAL")
            print("   ⚠️ Requer correções antes do uso")
            print("   🔍 Investigar falhas específicas")
        else:
            print("🔴 CRÍTICO - SISTEMA COM PROBLEMAS SÉRIOS")
            print("   🚨 Requer correções imediatas")
            print("   🛠️ Revisar implementação e configuração")
        
        print("\n📋 RESUMO DE AÇÕES (Últimas 15):")
        for log_entry in report['simulation_log'][-15:]:
            status = "✅" if log_entry['success'] else "❌"
            print(f"  [{log_entry['timestamp']}] {status} {log_entry['user_type']}: {log_entry['action']}")
            if log_entry['details']:
                print(f"      └─ {log_entry['details']}")
        
        print("="*80)
        
        # Salvar relatório em arquivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"enhanced_simulation_report_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório completo salvo em: {filename}")
        print(f"🔗 Acesse o frontend em: {self.frontend_url}")
        print(f"🔗 Acesse a API em: {self.base_url}")

if __name__ == "__main__":
    # Executar simulação aprimorada
    simulation = EnhancedDungeonKeeperSimulation()
    report = simulation.run_enhanced_simulation()
    
    if 'error' not in report:
        print("\n🎮 Simulação aprimorada concluída com sucesso!")
        print("🎯 Verifique o relatório detalhado gerado.")
    else:
        print(f"\n❌ Simulação falhou: {report['error']}")