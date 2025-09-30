#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db
from src import models

def list_products():
    try:
        db = next(get_db())
        items = db.query(models.Item).all()
        
        print('🏪 LISTA COMPLETA DOS PRODUTOS DO MERCADO MEDIEVAL')
        print('=' * 70)
        print(f'Total de produtos: {len(items)}')
        print('=' * 70)
        
        for i, item in enumerate(items, 1):
            print(f'{i:2d}. {item.name}')
            print(f'    📦 Tipo: {item.type}')
            print(f'    ⭐ Raridade: {item.rarity}')
            print(f'    💰 Preço: {item.price} moedas de ouro')
            print(f'    🖼️  Imagem: {item.image_url or "❌ Sem imagem"}')
            print(f'    📝 Descrição: {item.description or "❌ Sem descrição"}')
            print('-' * 50)
        
        print('\n🎯 RESUMO PARA CRIAÇÃO DE IMAGENS:')
        print('=' * 70)
        
        # Agrupar por tipo
        tipos = {}
        for item in items:
            if item.type not in tipos:
                tipos[item.type] = []
            tipos[item.type].append(item.name)
        
        for tipo, nomes in tipos.items():
            print(f'\n📂 {tipo.upper()}:')
            for nome in nomes:
                print(f'   • {nome}')
        
    except Exception as e:
        print(f'❌ Erro ao listar produtos: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    list_products()