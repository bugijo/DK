# -*- coding: utf-8 -*-
"""
Cliente de teste para verificar se o servidor está funcionando
"""

import requests
import time
import json

def test_server(url, max_attempts=5):
    """Testa o servidor com múltiplas tentativas"""
    for attempt in range(max_attempts):
        try:
            print(f"Tentativa {attempt + 1}: Testando {url}")
            response = requests.get(url, timeout=5)
            print(f"Status: {response.status_code}")
            print(f"Resposta: {response.json()}")
            return True
        except requests.exceptions.ConnectionError:
            print(f"Erro de conexão na tentativa {attempt + 1}")
        except requests.exceptions.Timeout:
            print(f"Timeout na tentativa {attempt + 1}")
        except Exception as e:
            print(f"Erro na tentativa {attempt + 1}: {e}")
        
        if attempt < max_attempts - 1:
            print("Aguardando 2 segundos antes da próxima tentativa...")
            time.sleep(2)
    
    return False

if __name__ == "__main__":
    print("=== Teste do Cliente ===")
    
    # Testa diferentes portas
    urls = [
        "http://127.0.0.1:8003/health",
        "http://127.0.0.1:8002/health",
        "http://127.0.0.1:8001/health",
        "http://127.0.0.1:8000/health"
    ]
    
    for url in urls:
        print(f"\n--- Testando {url} ---")
        success = test_server(url)
        if success:
            print(f"✅ Servidor em {url} está funcionando!")
            break
        else:
            print(f"❌ Servidor em {url} não está acessível")
    
    print("\n=== Fim do teste ===")