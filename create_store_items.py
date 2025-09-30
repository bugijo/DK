#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db
from src import crud, schemas
from datetime import datetime

def create_store_items():
    try:
        db = next(get_db())
        
        # Buscar o usuário admin
        admin_user = crud.get_user_by_username(db, username='admin')
        if not admin_user:
            print('Usuário admin não encontrado!')
            return
        
        print(f'Criando itens da loja para o usuário: {admin_user.username}')
        
        # Itens épicos para a loja medieval
        store_items = [
            {
                'name': 'Espada Longa Élfica',
                'description': 'Uma lâmina forjada pelos mestres elfos, com runas antigas gravadas que brilham sob a luz da lua. Causa dano adicional contra criaturas das trevas.',
                'type': 'Weapon',
                'rarity': 'Rare',
                'image_url': '⚔️',
                'price': 250
            },
            {
                'name': 'Armadura de Placas Dracônica',
                'description': 'Armadura forjada com escamas de dragão vermelho. Oferece proteção superior e resistência ao fogo.',
                'type': 'Armor',
                'rarity': 'Legendary',
                'image_url': '🛡️',
                'price': 500
            },
            {
                'name': 'Poção de Cura Maior',
                'description': 'Uma poção mágica que restaura instantaneamente ferimentos graves. Brilha com uma luz dourada reconfortante.',
                'type': 'Potion',
                'rarity': 'Uncommon',
                'image_url': '🧪',
                'price': 50
            },
            {
                'name': 'Escudo do Guardião',
                'description': 'Um escudo encantado que pode absorver ataques mágicos e refletir feitiços menores de volta ao atacante.',
                'type': 'Shield',
                'rarity': 'Rare',
                'image_url': '🛡️',
                'price': 180
            },
            {
                'name': 'Arco Élfico Longo',
                'description': 'Arco feito da madeira sagrada de Yggdrasil. Suas flechas voam mais longe e com precisão sobrenatural.',
                'type': 'Weapon',
                'rarity': 'Rare',
                'image_url': '🏹',
                'price': 200
            },
            {
                'name': 'Anel da Proteção',
                'description': 'Um anel mágico que cria uma barreira invisível ao redor do portador, aumentando sua defesa natural.',
                'type': 'Accessory',
                'rarity': 'Uncommon',
                'image_url': '💍',
                'price': 120
            },
            {
                'name': 'Cajado do Mago Ancião',
                'description': 'Cajado entalhado em madeira de carvalho milenário, amplifica o poder mágico e permite canalizar feitiços mais poderosos.',
                'type': 'Weapon',
                'rarity': 'Legendary',
                'image_url': '🪄',
                'price': 400
            },
            {
                'name': 'Botas da Velocidade',
                'description': 'Botas encantadas que permitem ao usuário se mover com velocidade sobre-humana e caminhar silenciosamente.',
                'type': 'Boots',
                'rarity': 'Uncommon',
                'image_url': '👢',
                'price': 90
            },
            {
                'name': 'Pergaminho de Bola de Fogo',
                'description': 'Pergaminho mágico que contém o feitiço Bola de Fogo. Pode ser usado uma vez para causar dano devastador.',
                'type': 'Scroll',
                'rarity': 'Common',
                'image_url': '📜',
                'price': 25
            },
            {
                'name': 'Corda Élfica',
                'description': 'Corda mágica que nunca se rompe e pode se estender até 100 metros. Essencial para qualquer aventureiro.',
                'type': 'Tool',
                'rarity': 'Common',
                'image_url': '🪢',
                'price': 15
            },
            {
                'name': 'Gema do Poder',
                'description': 'Uma gema rara que pulsa com energia mágica. Pode ser usada para encantar armas ou como componente de feitiços.',
                'type': 'Gem',
                'rarity': 'Rare',
                'image_url': '💎',
                'price': 300
            },
            {
                'name': 'Mochila do Aventureiro',
                'description': 'Mochila encantada com espaço extra-dimensional. Pode carregar muito mais do que aparenta.',
                'type': 'Container',
                'rarity': 'Uncommon',
                'image_url': '🎒',
                'price': 75
            }
        ]
        
        created_items = []
        for item_data in store_items:
            item_create = schemas.ItemCreate(
                name=item_data['name'],
                description=item_data['description'],
                type=item_data['type'],
                rarity=item_data['rarity'],
                image_url=item_data['image_url'],
                price=item_data['price']
            )
            
            # Verificar se o item já existe
            existing_item = db.query(crud.models.Item).filter(
                crud.models.Item.name == item_data['name'],
                crud.models.Item.creator_id == admin_user.id
            ).first()
            
            if not existing_item:
                created_item = crud.create_user_item(db, item_create, admin_user.id)
                created_items.append(created_item)
                print(f'Item criado: {created_item.name} - {created_item.rarity} ({created_item.price} moedas)')
            else:
                print(f'Item já existe: {existing_item.name}')
        
        print('\n✅ Loja medieval criada com sucesso!')
        print(f'🏪 Total de itens: {len(store_items)}')
        print(f'💰 Valor total da loja: {sum(item["price"] for item in store_items)} moedas de ouro')
        
    except Exception as e:
        print(f'❌ Erro ao criar itens da loja: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_store_items()