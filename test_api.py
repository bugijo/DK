#!/usr/bin/env python3
# Script de teste para verificar a API

import requests
import json

# Configurações
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_login():
    """Testa o login e retorna o token"""
    print("=== Testando Login ===")
    
    # Dados de teste (você pode ajustar conforme necessário)
    login_data = {
        "username": "admin",  # Ajuste conforme necessário
        "password": "admin123"  # Ajuste conforme necessário
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/token",
            data=login_data,  # FastAPI OAuth2 espera form data
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print(f"Token obtido: {token[:50]}...")
            return token
        else:
            print("Falha no login")
            return None
            
    except Exception as e:
        print(f"Erro no login: {e}")
        return None

def test_characters(token):
    """Testa a busca de personagens"""
    print("\n=== Testando Characters ===")
    
    if not token:
        print("Token não disponível")
        return
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{API_BASE}/characters/",
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            characters = response.json()
            print(f"Personagens encontrados: {len(characters)}")
            for char in characters:
                print(f"- {char.get('name', 'Sem nome')} (ID: {char.get('id', 'N/A')})")
        else:
            print("Falha ao buscar personagens")
            
    except Exception as e:
        print(f"Erro ao buscar personagens: {e}")

def test_users_me(token):
    """Testa a rota /users/me"""
    print("\n=== Testando Users/Me ===")
    
    if not token:
        print("Token não disponível")
        return
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{API_BASE}/users/me",
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"Usuário: {user_data.get('username', 'N/A')}")
            print(f"ID: {user_data.get('id', 'N/A')}")
        else:
            print("Falha ao buscar dados do usuário")
            
    except Exception as e:
        print(f"Erro ao buscar dados do usuário: {e}")

def main():
    print("Iniciando testes da API...")
    
    # Teste de login
    token = test_login()
    
    # Teste de users/me
    test_users_me(token)
    
    # Teste de characters
    test_characters(token)
    
    print("\nTestes concluídos!")

if __name__ == "__main__":
    main()