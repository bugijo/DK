#!/usr/bin/env python3
"""
Script para testar se os dados de teste foram criados com sucesso
"""

import requests
import json

def test_data_creation():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    # Fazer login
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Login
        print("🔐 Fazendo login...")
        response = requests.post(f"{base_url}/token", data=login_data)
        if response.status_code != 200:
            print(f"❌ Erro no login: {response.status_code} - {response.text}")
            return
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login realizado com sucesso")
        
        # Testar itens
        print("\n🎒 Testando itens...")
        response = requests.get(f"{base_url}/items/", headers=headers)
        if response.status_code == 200:
            items = response.json()
            print(f"✅ {len(items)} itens encontrados")
            if items:
                print(f"   Exemplo: {items[0]['name']}")
        else:
            print(f"❌ Erro ao buscar itens: {response.status_code}")
        
        # Testar monstros
        print("\n🐉 Testando monstros...")
        response = requests.get(f"{base_url}/monsters/", headers=headers)
        if response.status_code == 200:
            monsters = response.json()
            print(f"✅ {len(monsters)} monstros encontrados")
            if monsters:
                print(f"   Exemplo: {monsters[0]['name']}")
        else:
            print(f"❌ Erro ao buscar monstros: {response.status_code}")
        
        # Testar NPCs
        print("\n👥 Testando NPCs...")
        response = requests.get(f"{base_url}/npcs/", headers=headers)
        if response.status_code == 200:
            npcs = response.json()
            print(f"✅ {len(npcs)} NPCs encontrados")
            if npcs:
                print(f"   Exemplo: {npcs[0]['name']}")
        else:
            print(f"❌ Erro ao buscar NPCs: {response.status_code}")
        
        # Testar histórias
        print("\n📚 Testando histórias...")
        response = requests.get(f"{base_url}/stories/", headers=headers)
        if response.status_code == 200:
            stories = response.json()
            print(f"✅ {len(stories)} histórias encontradas")
            if stories:
                print(f"   Exemplo: {stories[0]['title']}")
        else:
            print(f"❌ Erro ao buscar histórias: {response.status_code}")
        
        print("\n🎉 Teste de dados concluído!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao backend. Verifique se está rodando na porta 8000.")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_data_creation()