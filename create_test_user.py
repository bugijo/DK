#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database import get_db
from src import crud, schemas

def create_test_user():
    try:
        db = next(get_db())
        
        # Verificar se o usuário já existe
        existing_user = crud.get_user_by_username(db, username='admin')
        if existing_user:
            print('Usuário admin já existe!')
            return
        
        # Criar novo usuário
        user_data = schemas.UserCreate(
            username='admin',
            email='admin@test.com',
            password='admin123'
        )
        
        created_user = crud.create_user(db, user_data)
        print(f'Usuário criado com sucesso: {created_user.username}')
        
    except Exception as e:
        print(f'Erro ao criar usuário: {e}')
    finally:
        db.close()

if __name__ == '__main__':
    create_test_user()