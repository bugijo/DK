import requests
import json

def test_users_me():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Login para obter token
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    print("=== TESTE LOGIN ===")
    login_response = requests.post(f"{base_url}/api/v1/token", data=login_data)
    print(f"Status Code: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        token = token_data["access_token"]
        print(f"Token obtido: {token[:20]}...")
        
        # 2. Testar GET /users/me
        print("\n=== TESTE GET /users/me ===")
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            me_response = requests.get(f"{base_url}/api/v1/users/me", headers=headers)
            print(f"Status Code: {me_response.status_code}")
            
            if me_response.status_code == 200:
                user_data = me_response.json()
                print(f"Usuário: {user_data.get('username')}")
                print(f"Email: {user_data.get('email')}")
                print(f"ID: {user_data.get('id')}")
                print(f"Ativo: {user_data.get('is_active')}")
                print("✅ GET /users/me funcionou!")
            else:
                print(f"❌ Erro: {me_response.text}")
                
        except Exception as e:
            print(f"❌ Exceção: {e}")
    else:
        print(f"❌ Login falhou: {login_response.text}")

if __name__ == "__main__":
    test_users_me()