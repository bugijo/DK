import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

try:
    # Primeiro registrar um usuário
    user_data = {"username": "TestUser", "email": "test@test.com", "password": "password123"}
    
    print("1. Registrando usuário...")
    reg_response = requests.post(f"{BASE_URL}/register", json=user_data)
    print(f"Registro - Status: {reg_response.status_code}")
    
    # Testar login com JSON (como está no schema)
    print("\n2. Testando login com JSON...")
    login_data = {"username": user_data['username'], "password": user_data['password']}
    token_response = requests.post(f"{BASE_URL}/token", json=login_data)
    
    print(f"Token - Status: {token_response.status_code}")
    print(f"Token - Response: {token_response.text}")
    
    if token_response.status_code == 200:
        print("✅ Login funcionando com JSON!")
    else:
        print(f"❌ Erro no login: {token_response.status_code}")
        
except Exception as e:
    print(f"❌ Erro: {e}")