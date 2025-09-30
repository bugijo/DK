#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar o servidor mínimo
"""

import requests
import time

def test_server():
    base_url = "http://127.0.0.1:8001"
    
    print("=== Testando servidor mínimo ===")
    
    # Teste 1: /ping
    try:
        print("\n1. Testando /ping...")
        response = requests.get(f"{base_url}/ping", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Erro: {e}")
    
    time.sleep(1)
    
    # Teste 2: /health
    try:
        print("\n2. Testando /health...")
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Erro: {e}")
    
    time.sleep(1)
    
    # Teste 3: Segunda requisição para /ping
    try:
        print("\n3. Segunda requisição para /ping...")
        response = requests.get(f"{base_url}/ping", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print("   ✅ Servidor ainda está ativo após múltiplas requisições!")
    except Exception as e:
        print(f"   ❌ Erro na segunda requisição: {e}")
        print("   Isso indica que o servidor parou após a primeira requisição.")

if __name__ == "__main__":
    test_server()