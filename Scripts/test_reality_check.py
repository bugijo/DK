# scripts/test_reality_check.py

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_status(message, success=True):
    """Função auxiliar para imprimir status coloridos."""
    color_code = "\033[92m" if success else "\033[91m"
    print(f"{color_code}{message}\033[0m")

def run_test():
    session = requests.Session()
    mestre_token = None
    jogador_token = None
    table_id = None

    try:
        # --- PASSO 1: Registrar os dois usuários ---
        print("\n--- INICIANDO TESTE DE REALIDADE AUTOMATIZADO ---")
        mestre_data = {"username": "MestreA_Auto", "email": "mestre_auto@test.com", "password": "password123"}
        jogador_data = {"username": "JogadorB_Auto", "email": "jogador_auto@test.com", "password": "password123"}
        
        session.post(f"{BASE_URL}/register", json=mestre_data)
        print_status("✅ Usuário MestreA_Auto registrado.")
        session.post(f"{BASE_URL}/register", json=jogador_data)
        print_status("✅ Usuário JogadorB_Auto registrado.")

        # --- PASSO 2: Fazer login com os dois usuários para obter tokens ---
        login_mestre_res = session.post(f"{BASE_URL}/token", json={"username": mestre_data['username'], "password": mestre_data['password']})
        login_mestre_res.raise_for_status()  # Lança um erro se o status não for 2xx
        mestre_token = login_mestre_res.json()['access_token']
        print_status("✅ Login de MestreA_Auto bem-sucedido. Token obtido.")
        
        login_jogador_res = session.post(f"{BASE_URL}/token", json={"username": jogador_data['username'], "password": jogador_data['password']})
        login_jogador_res.raise_for_status()
        jogador_token = login_jogador_res.json()['access_token']
        print_status("✅ Login de JogadorB_Auto bem-sucedido. Token obtido.")

        # --- PASSO 3: MestreA cria uma mesa ---
        mestre_headers = {"Authorization": f"Bearer {mestre_token}"}
        table_data = {"title": "Mesa Automatizada", "description": "Uma mesa criada pelo script de teste."}
        create_table_res = session.post(f"{BASE_URL}/tables", headers=mestre_headers, json=table_data)
        create_table_res.raise_for_status()
        table_id = create_table_res.json()['id']
        print_status(f"✅ MestreA_Auto criou a mesa com ID: {table_id}")

        # --- PASSO 4: JogadorB solicita para entrar na mesa ---
        jogador_headers = {"Authorization": f"Bearer {jogador_token}"}
        join_request_res = session.post(f"{BASE_URL}/tables/{table_id}/join", headers=jogador_headers)
        join_request_res.raise_for_status()
        print_status(f"✅ JogadorB_Auto solicitou para entrar na mesa.")

        # --- PASSO 5: O TESTE DE FOGO - MestreA verifica as solicitações ---
        print("\n--- VERIFICAÇÃO FINAL ---")
        get_tables_res = session.get(f"{BASE_URL}/tables", headers=mestre_headers)
        get_tables_res.raise_for_status()
        tables = get_tables_res.json()
        
        mesa_encontrada = next((t for t in tables if t['id'] == table_id), None)
        
        if not mesa_encontrada:
            raise Exception("ERRO: A mesa criada não foi encontrada na lista!")
            
        join_requests = mesa_encontrada.get("join_requests", [])
        if any(req['user']['username'] == jogador_data['username'] for req in join_requests):
            print_status("\n🎉 SUCESSO! A solicitação do JogadorB_Auto foi encontrada na mesa do MestreA_Auto.", success=True)
            print_status("O backend está funcionando como esperado!", success=True)
        else:
            raise Exception("FALHA: A solicitação do JogadorB_Auto NÃO foi encontrada na mesa!")

    except Exception as e:
        print_status(f"\n❌ TESTE FALHOU: {e}", success=False)

if __name__ == "__main__":
    run_test()