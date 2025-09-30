import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

try:
    # Teste do endpoint de registro
    mestre_data = {"username": "MestreTest", "email": "mestre@test.com", "password": "password123"}
    
    print("Testando endpoint de registro...")
    response = requests.post(f"{BASE_URL}/register", json=mestre_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Endpoint de registro funcionando!")
    else:
        print(f"❌ Erro no registro: {response.status_code}")
        
except Exception as e:
    print(f"❌ Erro de conexão: {e}")