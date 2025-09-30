#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para popular o banco de dados com dados de teste
Incluindo monstros, histórias, NPCs e itens para demonstração
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from src.database import SessionLocal, engine
from src import models, crud, schemas
import uuid

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass

def create_test_data():
    """Cria dados de teste para o usuário admin"""
    db = get_db()
    
    try:
        # Buscar o usuário admin
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            print("❌ Usuário 'admin' não encontrado. Execute create_test_user.py primeiro.")
            return
        
        print(f"✅ Usuário encontrado: {admin_user.username} (ID: {admin_user.id})")
        
        # === CRIAR ITENS DE TESTE ===
        print("\n🎒 Criando itens de teste...")
        
        test_items = [
            {
                "name": "Espada Longa +1",
                "description": "Uma espada longa mágica com lâmina afiada que brilha levemente.",
                "item_type": "Arma",
                "rarity": "Incomum",
                "weight": 3.0,
                "value": 150,
                "properties": ["Versátil (1d10)", "Mágica +1"]
            },
            {
                "name": "Poção de Cura",
                "description": "Um líquido vermelho que restaura pontos de vida quando consumido.",
                "item_type": "Poção",
                "rarity": "Comum",
                "weight": 0.5,
                "value": 50,
                "properties": ["Cura 2d4+2 PV", "Consumível"]
            },
            {
                "name": "Armadura de Couro Batido",
                "description": "Armadura leve feita de couro resistente.",
                "item_type": "Armadura",
                "rarity": "Comum",
                "weight": 10.0,
                "value": 45,
                "properties": ["CA 11 + Mod Des", "Armadura Leve"]
            },
            {
                "name": "Anel de Proteção",
                "description": "Um anel mágico que oferece proteção contra ataques.",
                "item_type": "Anel",
                "rarity": "Raro",
                "weight": 0.1,
                "value": 3500,
                "properties": ["+1 CA", "+1 Testes de Resistência", "Requer Sintonização"]
            }
        ]
        
        for item_data in test_items:
            item_create = schemas.ItemCreate(**item_data)
            created_item = crud.create_user_item(db=db, item=item_create, user_id=admin_user.id)
            print(f"  ✅ Item criado: {created_item.name}")
        
        # === CRIAR MONSTROS DE TESTE ===
        print("\n🐉 Criando monstros de teste...")
        
        test_monsters = [
            {
                "name": "Goblin Guerreiro",
                "size": "Pequeno",
                "type": "Humanoide",
                "alignment": "Neutro Maligno",
                "armor_class": 15,
                "hit_points": "7 (2d6)",
                "speed": "9 metros",
                "strength": 8,
                "dexterity": 14,
                "constitution": 10,
                "intelligence": 10,
                "wisdom": 8,
                "charisma": 8,
                "skills": "Furtividade +6",
                "senses": "Visão no Escuro 18m",
                "languages": "Comum, Goblin",
                "challenge_rating": "1/4",
                "experience_points": 50,
                "special_abilities": "Ataque Furtivo: +1d6 de dano quando tem vantagem",
                "actions": "Cimitarra: +4 para acertar, 1d6+2 de dano cortante",
                "description": "Um goblin astuto armado com cimitarra e armadura de couro."
            },
            {
                "name": "Lobo Sombrio",
                "size": "Médio",
                "type": "Besta",
                "alignment": "Neutro",
                "armor_class": 13,
                "hit_points": "11 (2d8+2)",
                "speed": "12 metros",
                "strength": 12,
                "dexterity": 15,
                "constitution": 12,
                "intelligence": 3,
                "wisdom": 12,
                "charisma": 6,
                "skills": "Percepção +3, Furtividade +4",
                "senses": "Percepção Passiva 13",
                "languages": "—",
                "challenge_rating": "1/4",
                "experience_points": 50,
                "special_abilities": "Audição e Olfato Aguçados: Vantagem em testes de Percepção",
                "actions": "Mordida: +4 para acertar, 2d4+2 de dano perfurante. Alvo deve fazer TR de Força CD 11 ou cair no chão.",
                "description": "Um lobo de pelagem escura que caça nas sombras da floresta."
            },
            {
                "name": "Esqueleto Guerreiro",
                "size": "Médio",
                "type": "Morto-vivo",
                "alignment": "Leal Maligno",
                "armor_class": 13,
                "hit_points": "13 (2d8+4)",
                "speed": "9 metros",
                "strength": 10,
                "dexterity": 14,
                "constitution": 15,
                "intelligence": 6,
                "wisdom": 8,
                "charisma": 5,
                "damage_resistances": "Perfurante",
                "damage_immunities": "Veneno",
                "condition_immunities": "Envenenado, Exaustão",
                "senses": "Visão no Escuro 18m",
                "languages": "Entende as línguas que conhecia em vida",
                "challenge_rating": "1/4",
                "experience_points": 50,
                "actions": "Espada Curta: +4 para acertar, 1d6+2 de dano perfurante. Arco Curto: +4 para acertar, alcance 24/96m, 1d6+2 de dano perfurante.",
                "description": "Os restos reanimados de um guerreiro morto, ainda empunhando suas armas."
            }
        ]
        
        for monster_data in test_monsters:
            monster_create = schemas.MonsterCreate(**monster_data)
            created_monster = crud.create_monster_for_user(db=db, monster=monster_create, user_id=admin_user.id)
            print(f"  ✅ Monstro criado: {created_monster.name}")
        
        # === CRIAR NPCS DE TESTE ===
        print("\n👥 Criando NPCs de teste...")
        
        test_npcs = [
            {
                "name": "Elara Pedraverde",
                "race": "Elfa",
                "character_class": "Ranger",
                "level": 3,
                "size": "Médio",
                "alignment": "Neutro Bom",
                "armor_class": 14,
                "hit_points": "27 (3d10+3)",
                "speed": "9 metros",
                "strength": 11,
                "dexterity": 16,
                "constitution": 13,
                "intelligence": 12,
                "wisdom": 15,
                "charisma": 11,
                "skills": "Sobrevivência +4, Percepção +4, Furtividade +5",
                "senses": "Visão no Escuro 18m",
                "languages": "Comum, Élfico",
                "challenge_rating": "1",
                "experience_points": 200,
                "personality_traits": "Fala pouco, mas suas palavras são sempre sábias.",
                "ideals": "A natureza deve ser protegida dos que a corrompem.",
                "bonds": "Jurou proteger a Floresta Sussurrante.",
                "flaws": "Desconfia de magos e suas artes arcanas.",
                "special_abilities": "Rastreamento, Inimigo Favorito (Orcs)",
                "actions": "Arco Longo: +5 para acertar, 1d8+3 de dano perfurante. Espada Curta: +5 para acertar, 1d6+3 de dano perfurante.",
                "equipment": ["Arco Longo", "Aljava com 30 flechas", "Espada Curta", "Armadura de Couro Batido"],
                "description": "Uma ranger élfica de cabelos castanhos e olhos verdes, guardiã da floresta.",
                "backstory": "Nascida na Floresta Sussurrante, Elara dedica sua vida a proteger as terras selvagens.",
                "role": "Guia e Protetora",
                "location": "Floresta Sussurrante",
                "faction": "Guardiões da Natureza",
                "quest_hooks": "Pode contratar aventureiros para investigar a corrupção na floresta."
            },
            {
                "name": "Thorek Marteloferro",
                "race": "Anão",
                "character_class": "Ferreiro",
                "level": 5,
                "size": "Médio",
                "alignment": "Leal Neutro",
                "armor_class": 16,
                "hit_points": "45 (5d10+15)",
                "speed": "7,5 metros",
                "strength": 16,
                "dexterity": 10,
                "constitution": 16,
                "intelligence": 14,
                "wisdom": 12,
                "charisma": 10,
                "skills": "Ofício (Ferreiro) +6, História +4",
                "senses": "Visão no Escuro 18m",
                "languages": "Comum, Anão",
                "challenge_rating": "2",
                "experience_points": 450,
                "personality_traits": "Orgulhoso de seu trabalho, nunca entrega uma arma imperfeita.",
                "ideals": "A qualidade do trabalho reflete o caráter da pessoa.",
                "bonds": "Sua forja é sua vida, herdada de seu pai.",
                "flaws": "Teimoso demais para admitir quando está errado.",
                "special_abilities": "Resistência a Veneno, Conhecimento de Pedra",
                "actions": "Martelo de Guerra: +5 para acertar, 1d8+3 de dano contundente.",
                "equipment": ["Martelo de Guerra", "Armadura de Escamas", "Ferramentas de Ferreiro"],
                "description": "Um anão robusto com barba grisalha e mãos calejadas pelo trabalho na forja.",
                "backstory": "Herdou a forja de sua família e é conhecido por criar as melhores armas da região.",
                "role": "Ferreiro e Comerciante",
                "location": "Vila de Pedravale",
                "faction": "Guilda dos Artesãos",
                "quest_hooks": "Precisa de materiais raros para forjar uma arma lendária."
            },
            {
                "name": "Seraphina Luaverde",
                "race": "Humana",
                "character_class": "Clériga",
                "level": 4,
                "size": "Médio",
                "alignment": "Leal Bom",
                "armor_class": 15,
                "hit_points": "32 (4d8+8)",
                "speed": "9 metros",
                "strength": 12,
                "dexterity": 10,
                "constitution": 14,
                "intelligence": 13,
                "wisdom": 16,
                "charisma": 15,
                "skills": "Medicina +5, Religião +3, Intuição +5",
                "senses": "Percepção Passiva 13",
                "languages": "Comum, Celestial",
                "challenge_rating": "2",
                "experience_points": 450,
                "personality_traits": "Sempre vê o melhor nas pessoas, mesmo nos piores momentos.",
                "ideals": "A compaixão é a maior virtude que alguém pode ter.",
                "bonds": "Dedica sua vida a servir os necessitados em nome de sua deusa.",
                "flaws": "Confia demais nas pessoas, às vezes sendo ingênua.",
                "special_abilities": "Canalizar Divindade (2/descanso), Magias de Clériga",
                "actions": "Maça: +3 para acertar, 1d6+1 de dano contundente. Magias: Curar Ferimentos, Bênção, Palavra Curativa.",
                "equipment": ["Maça", "Escudo", "Armadura de Cota de Malha", "Símbolo Sagrado"],
                "description": "Uma jovem clériga de cabelos dourados e olhos azuis, sempre com um sorriso gentil.",
                "backstory": "Órfã criada no templo, dedicou sua vida a ajudar os necessitados.",
                "role": "Curandeira e Conselheira Espiritual",
                "location": "Templo da Luz Dourada",
                "faction": "Igreja da Luz Dourada",
                "quest_hooks": "Busca aventureiros para recuperar relíquias sagradas roubadas."
            }
        ]
        
        for npc_data in test_npcs:
            npc_create = schemas.NPCCreate(**npc_data)
            created_npc = crud.create_npc_for_user(db=db, npc=npc_create, user_id=admin_user.id)
            print(f"  ✅ NPC criado: {created_npc.name}")
        
        # === CRIAR HISTÓRIAS DE TESTE ===
        print("\n📚 Criando histórias de teste...")
        
        test_stories = [
            {
                "title": "O Mistério da Floresta Sussurrante",
                "description": "Uma aventura de investigação em uma floresta mágica onde criaturas estão desaparecendo misteriosamente.",
                "content": """# O Mistério da Floresta Sussurrante

## Resumo da Aventura
Os aventureiros são contratados pela ranger Elara Pedraverde para investigar o desaparecimento de animais na Floresta Sussurrante. Uma força sombria parece estar corrompendo a natureza.

## Capítulo 1: O Chamado
- Os PCs chegam à vila de Pedravale
- Encontram com Elara no taverna "O Javali Dourado"
- Ela explica sobre os desaparecimentos e oferece 200 moedas de ouro pela investigação

## Capítulo 2: Adentrando a Floresta
- Trilhas estranhas levam a uma clareira corrompida
- Encontro com lobos sombrios (usar stats do Lobo Sombrio)
- Descoberta de runas sombrias em árvores mortas

## Capítulo 3: O Covil do Necromante
- Caverna escondida com esqueletos guardiões
- Confronto final com um necromante iniciante
- Resgate dos animais capturados

## Recompensas
- 200 moedas de ouro
- Poção de Cura para cada PC
- Amizade de Elara (contato futuro)""",
                "setting": "Floresta Sussurrante e Vila de Pedravale",
                "level_range": "1-3",
                "estimated_duration": "4-6 horas",
                "themes": ["Investigação", "Natureza", "Necromancia"]
            },
            {
                "title": "A Forja Perdida dos Anões",
                "description": "Uma aventura de exploração em busca de uma antiga forja anã perdida nas montanhas.",
                "content": """# A Forja Perdida dos Anões

## Resumo da Aventura
Thorek Marteloferro precisa de ajuda para encontrar a lendária Forja de Mithril, perdida há séculos nas Montanhas Gélidas. Apenas com ela poderá forjar a arma necessária para defender a vila.

## Capítulo 1: A Proposta
- Thorek explica sobre a ameaça de orcs nas montanhas
- Mostra mapas antigos da localização da forja
- Oferece uma arma mágica como pagamento

## Capítulo 2: A Jornada
- Escalada perigosa nas montanhas
- Encontros com goblins guerreiros (usar stats do Goblin Guerreiro)
- Descoberta de ruínas anãs antigas

## Capítulo 3: A Forja Guardada
- Entrada protegida por armadilhas anãs
- Guardiões esqueletos (usar stats do Esqueleto Guerreiro)
- Reativação da forja mágica

## Capítulo 4: O Retorno Heroico
- Thorek forja a arma prometida
- Defesa da vila contra o ataque orc
- Celebração e reconhecimento

## Recompensas
- Arma mágica forjada por Thorek
- 300 moedas de ouro
- Título de "Amigos dos Anões""",
                "setting": "Montanhas Gélidas e Vila de Pedravale",
                "level_range": "3-5",
                "estimated_duration": "6-8 horas",
                "themes": ["Exploração", "Anões", "Forjaria", "Combate"]
            },
            {
                "title": "O Templo Profanado",
                "description": "Uma missão sagrada para purificar um templo corrompido e recuperar relíquias roubadas.",
                "content": """# O Templo Profanado

## Resumo da Aventura
Seraphina Luaverde pede ajuda para recuperar relíquias sagradas roubadas do Templo da Luz Dourada. Os ladrões se refugiaram em um templo abandonado que agora está corrompido.

## Capítulo 1: A Súplica
- Seraphina explica sobre o roubo das relíquias
- Mostra visões divinas do local onde estão escondidas
- Oferece bênçãos divinas como recompensa

## Capítulo 2: O Templo Sombrio
- Chegada ao templo abandonado
- Atmosfera opressiva e sinais de corrupção
- Primeiros encontros com mortos-vivos

## Capítulo 3: Os Guardiões Corrompidos
- Salas com armadilhas e esqueletos guardiões
- Descoberta dos ladrões transformados em mortos-vivos
- Pistas sobre o verdadeiro vilão

## Capítulo 4: A Purificação
- Confronto com o cultista responsável
- Ritual de purificação do templo
- Recuperação das relíquias sagradas

## Recompensas
- Bênção permanente (+1 em um atributo)
- Relíquia menor (amuleto de proteção)
- 250 moedas de ouro
- Acesso a serviços do templo""",
                "setting": "Templo Abandonado e Templo da Luz Dourada",
                "level_range": "2-4",
                "estimated_duration": "5-7 horas",
                "themes": ["Religião", "Mortos-vivos", "Purificação", "Mistério"]
            }
        ]
        
        for story_data in test_stories:
            story_create = schemas.StoryCreate(**story_data)
            created_story = crud.create_story_for_user(db=db, story_data=story_create, user_id=admin_user.id)
            print(f"  ✅ História criada: {created_story.title}")
        
        print("\n🎉 Dados de teste criados com sucesso!")
        print("\n📊 Resumo:")
        print(f"  • {len(test_items)} itens criados")
        print(f"  • {len(test_monsters)} monstros criados")
        print(f"  • {len(test_npcs)} NPCs criados")
        print(f"  • {len(test_stories)} histórias criadas")
        
        print("\n✨ Agora você pode testar o frontend com dados reais!")
        print("   Frontend: http://localhost:3001")
    print("   Backend API: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"❌ Erro ao criar dados de teste: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Iniciando criação de dados de teste...")
    create_test_data()