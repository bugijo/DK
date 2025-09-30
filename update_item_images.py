#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db
from src import models

def update_item_images():
    try:
        db = next(get_db())
        
        # Mapeamento de nomes para emojis
        emoji_mapping = {
            'Espada Longa Élfica': '⚔️',
            'Armadura de Placas Dracônica': '🛡️',
            'Poção de Cura Maior': '🧪',
            'Escudo do Guardião': '🛡️',
            'Arco Élfico Longo': '🏹',
            'Anel da Proteção': '💍',
            'Cajado do Mago Ancião': '🪄',
            'Botas da Velocidade': '👢',
            'Pergaminho de Bola de Fogo': '📜',
            'Corda Élfica': '🪢',
            'Gema do Poder': '💎',
            'Mochila do Aventureiro': '🎒'
        }
        
        print('🔄 Atualizando imagens dos itens...')
        print('=' * 50)
        
        updated_count = 0
        for item_name, emoji in emoji_mapping.items():
            item = db.query(models.Item).filter(models.Item.name == item_name).first()
            if item:
                item.image_url = emoji
                updated_count += 1
                print(f'✅ {item_name} -> {emoji}')
            else:
                print(f'❌ Item não encontrado: {item_name}')
        
        db.commit()
        print('\n' + '=' * 50)
        print(f'🎉 {updated_count} itens atualizados com sucesso!')
        print('🏪 Imagens agora são emojis - sem problemas de CORS!')
        
    except Exception as e:
        print(f'❌ Erro ao atualizar imagens: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    update_item_images()