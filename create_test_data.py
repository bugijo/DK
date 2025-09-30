#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db
from src import crud, schemas
from datetime import datetime

def create_test_data():
    try:
        db = next(get_db())
        
        # Buscar o usuário admin
        admin_user = crud.get_user_by_username(db, username='admin')
        if not admin_user:
            print('Usuário admin não encontrado!')
            return
        
        print(f'Criando dados de teste para o usuário: {admin_user.username}')
        
        # Criar histórias de teste primeiro
        test_stories = [
            {
                'title': 'A Lenda do Dragão Dourado',
                'synopsis': 'Uma aventura épica onde os heróis devem encontrar o lendário Dragão Dourado para salvar o reino.'
            },
            {
                'title': 'Mistérios das Masmorras Sombrias',
                'synopsis': 'Explore masmorras antigas repletas de armadilhas mortais e criaturas das trevas.'
            },
            {
                'title': 'O Reino Élfico Perdido',
                'synopsis': 'Uma jornada através de florestas encantadas para descobrir segredos ancestrais.'
            }
        ]
        
        created_stories = []
        for story_data in test_stories:
            story_create = schemas.StoryCreate(
                title=story_data['title'],
                synopsis=story_data['synopsis'],
                item_ids=[],
                monster_ids=[],
                npc_ids=[]
            )
            
            # Verificar se a história já existe
            existing_story = db.query(crud.models.Story).filter(
                crud.models.Story.title == story_data['title'],
                crud.models.Story.creator_id == admin_user.id
            ).first()
            
            if not existing_story:
                created_story = crud.create_story_for_user(db, story_create, admin_user.id)
                created_stories.append(created_story)
                print(f'História criada: {created_story.title}')
            else:
                created_stories.append(existing_story)
                print(f'História já existe: {existing_story.title}')
        
        # Criar mesas de teste
        test_tables = [
            {
                'title': 'Mesa: A Taverna do Dragão Dourado',
                'description': 'Uma aventura épica em uma taverna misteriosa onde dragões antigos guardam segredos ancestrais.',
                'max_players': 6,
                'story_index': 0
            },
            {
                'title': 'Mesa: Masmorras de Pedra Sombria',
                'description': 'Explore as profundezas de uma masmorra abandonada repleta de criaturas sombrias e tesouros perdidos.',
                'max_players': 4,
                'story_index': 1
            },
            {
                'title': 'Mesa: O Reino dos Elfos Perdidos',
                'description': 'Uma jornada através de florestas encantadas para descobrir o destino de uma civilização élfica desaparecida.',
                'max_players': 5,
                'story_index': 2
            }
        ]
        
        created_tables = []
        for table_data in test_tables:
            story_id = created_stories[table_data['story_index']].id
            
            table_create = schemas.TableCreate(
                title=table_data['title'],
                description=table_data['description'],
                max_players=table_data['max_players'],
                story_id=story_id
            )
            
            # Verificar se a mesa já existe
            existing_table = db.query(crud.models.Table).filter(
                crud.models.Table.title == table_data['title'],
                crud.models.Table.master_id == admin_user.id
            ).first()
            
            if not existing_table:
                created_table = crud.create_table(db, table_create, admin_user.id)
                created_tables.append(created_table)
                print(f'Mesa criada: {created_table.title}')
            else:
                created_tables.append(existing_table)
                print(f'Mesa já existe: {existing_table.title}')
        
        # Criar personagens de teste
        test_characters = [
            {
                'name': 'Thorin Escudo de Ferro',
                'race': 'Anão',
                'character_class': 'Guerreiro',
                'level': 5,
                'background': 'Soldado',
                'description': 'Um anão corajoso com um martelo de guerra ancestral e uma barba trançada com fios de ouro.'
            },
            {
                'name': 'Lyralei Folha Verde',
                'race': 'Elfo',
                'character_class': 'Patrulheiro',
                'level': 4,
                'background': 'Eremita',
                'description': 'Uma elfa ágil especialista em arco e flecha, guardiã das florestas antigas.'
            },
            {
                'name': 'Gandalf, o Sábio',
                'race': 'Humano',
                'character_class': 'Mago',
                'level': 8,
                'background': 'Erudito',
                'description': 'Um mago poderoso com conhecimento ancestral e um cajado mágico brilhante.'
            },
            {
                'name': 'Sombra Silenciosa',
                'race': 'Halfling',
                'character_class': 'Ladino',
                'level': 3,
                'background': 'Criminoso',
                'description': 'Um halfling ágil e sorrateiro, mestre em desarmar armadilhas e abrir fechaduras.'
            }
        ]
        
        for char_data in test_characters:
            character_create = schemas.CharacterCreate(
                name=char_data['name'],
                race=char_data['race'],
                character_class=char_data['character_class'],
                level=char_data['level'],
                background=char_data['background'],
                backstory=char_data['description']
            )
            
            # Verificar se o personagem já existe
            existing_char = db.query(crud.models.Character).filter(
                crud.models.Character.name == char_data['name'],
                crud.models.Character.owner_id == admin_user.id
            ).first()
            
            if not existing_char:
                created_char = crud.create_character_for_user(db, character_create, admin_user.id)
                print(f'Personagem criado: {created_char.name} - {created_char.character_class} Nível {created_char.level}')
            else:
                print(f'Personagem já existe: {existing_char.name}')
        
        print('\n✅ Dados de teste criados com sucesso!')
        print(f'📊 Total de mesas: {len(created_tables)}')
        print(f'🎭 Total de personagens: {len(test_characters)}')
        
    except Exception as e:
        print(f'❌ Erro ao criar dados de teste: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_test_data()