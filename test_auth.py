import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_register():
    print("=== Testando Registro ===")
    user_data = {
        "username": "teste_user",
        "email": "teste@example.com",
        "password": "senha123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=user_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Erro no registro: {e}")
        return False

def test_login():
    print("\n=== Testando Login ===")
    login_data = {
        "username": "teste_user",
        "password": "senha123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token", json=login_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"Token obtido: {token[:20]}...")
            return token
        return None
    except Exception as e:
        print(f"Erro no login: {e}")
        return None

if __name__ == "__main__":
    # Teste de registro
    register_success = test_register()
    
    # Teste de login
    if register_success:
        token = test_login()
        if token:
            print("\n✅ Autenticação funcionando!")
        else:
            print("\n❌ Problema no login")
    else:
        print("\n❌ Problema no registro")