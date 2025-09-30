import requests
import json

# Dados do usuário de teste
user_data = {
    "username": "teste",
    "email": "teste@teste.com",
    "password": "123456"
}

# URL base da API
base_url = "http://127.0.0.1:8000"

print("=== Testando Registro ===")
try:
    response = requests.post(f"{base_url}/api/v1/register", json=user_data)
    print(f"Status do registro: {response.status_code}")
    print(f"Headers da resposta: {dict(response.headers)}")
    if response.status_code == 200:
        print("✅ Usuário registrado com sucesso!")
        print(f"Resposta: {response.json()}")
    else:
        print(f"❌ Erro no registro")
        print(f"Resposta do registro: {response.text}")
        try:
            error_detail = response.json()
            print(f"Detalhes do erro: {error_detail}")
        except:
            pass
except Exception as e:
    print(f"❌ Erro na requisição de registro: {e}")

print("\n=== Testando Login ===")
try:
    # Testando com form data (como o frontend faz)
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    # Primeiro teste: JSON
    print("Teste 1: Enviando como JSON")
    response = requests.post(f"{base_url}/api/v1/token", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Resposta: {response.text}")
    
    # Segundo teste: Form data
    print("\nTeste 2: Enviando como form data")
    response = requests.post(f"{base_url}/api/v1/token", data=login_data)
    print(f"Status: {response.status_code}")
    print(f"Resposta: {response.text}")
    
    if response.status_code == 200:
        token_data = response.json()
        print("✅ Login realizado com sucesso!")
        print(f"Token: {token_data['access_token'][:50]}...")
    else:
        print(f"❌ Problema no login")
        try:
            error_detail = response.json()
            print(f"Detalhes do erro: {error_detail}")
        except:
            pass
except Exception as e:
    print(f"❌ Erro na requisição de login: {e}")