#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste simples e rápido do FastAPI
"""

import sys
import os
import time
import subprocess
import threading
from pathlib import Path

def quick_test():
    """Teste rápido sem criar ambientes"""
    print("🔍 TESTE RÁPIDO DO FASTAPI")
    print("="*40)
    
    # Verifica se FastAPI está instalado
    try:
        import fastapi
        import uvicorn
        print(f"✅ FastAPI {fastapi.__version__} encontrado")
        print(f"✅ Uvicorn {uvicorn.__version__} encontrado")
    except ImportError as e:
        print(f"❌ Dependências não encontradas: {e}")
        print("\n💡 SOLUÇÃO: Instale as dependências:")
        print("pip install fastapi uvicorn[standard]")
        return
    
    # Verifica se minimal.py existe
    if not Path("minimal.py").exists():
        print("❌ Arquivo minimal.py não encontrado")
        return
    
    print("\n🚀 Iniciando teste do servidor...")
    
    # Inicia servidor em processo separado
    server_process = None
    try:
        server_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "minimal:app", 
            "--host", "127.0.0.1", "--port", "8001"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Aguarda servidor iniciar
        print("⏳ Aguardando servidor iniciar...")
        time.sleep(3)
        
        # Verifica se processo ainda está rodando
        if server_process.poll() is not None:
            stdout, stderr = server_process.communicate()
            print(f"❌ Servidor parou imediatamente")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return
        
        print("✅ Servidor iniciado")
        
        # Testa requisições
        try:
            import requests
        except ImportError:
            print("❌ Requests não instalado. Instalando...")
            subprocess.run([sys.executable, "-m", "pip", "install", "requests"])
            import requests
        
        # Primeira requisição
        print("\n📡 Testando primeira requisição...")
        try:
            response1 = requests.get("http://127.0.0.1:8001/ping", timeout=5)
            print(f"✅ Primeira: {response1.status_code} - {response1.json()}")
        except Exception as e:
            print(f"❌ Primeira requisição falhou: {e}")
            return
        
        # Aguarda um pouco
        time.sleep(1)
        
        # Verifica se servidor ainda está rodando
        if server_process.poll() is not None:
            print("❌ Servidor parou após primeira requisição")
            stdout, stderr = server_process.communicate()
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return
        
        # Segunda requisição
        print("📡 Testando segunda requisição...")
        try:
            response2 = requests.get("http://127.0.0.1:8001/ping", timeout=5)
            print(f"✅ Segunda: {response2.status_code} - {response2.json()}")
        except Exception as e:
            print(f"❌ Segunda requisição falhou: {e}")
            return
        
        print("\n🎉 SUCESSO! Servidor funcionou corretamente!")
        
    except Exception as e:
        print(f"❌ Erro durante teste: {e}")
    
    finally:
        # Para servidor
        if server_process and server_process.poll() is None:
            print("\n🛑 Parando servidor...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
        
        print("✅ Teste concluído")

def show_solutions():
    """Mostra soluções disponíveis"""
    print("\n" + "="*50)
    print("💡 SOLUÇÕES DISPONÍVEIS")
    print("="*50)
    
    print("\n1️⃣ DOCKER (Recomendado)")
    print("   docker-compose up --build")
    print("   Testa em: http://localhost:8000/ping")
    
    print("\n2️⃣ NOVO AMBIENTE VIRTUAL")
    print("   python -m venv venv_novo")
    print("   venv_novo\\Scripts\\activate")
    print("   pip install fastapi uvicorn[standard]")
    print("   uvicorn minimal:app --port 8001")
    
    print("\n3️⃣ REINSTALAR PYTHON")
    print("   Baixar Python 3.11+ do python.org")
    print("   Reinstalar completamente")
    
    print("\n4️⃣ USAR OUTRO SERVIDOR")
    print("   pip install gunicorn")
    print("   gunicorn minimal:app -w 1 -k uvicorn.workers.UvicornWorker")

def test_server_connection():
    """Testa conexão com servidor existente"""
    import requests
    import time

    print("Testando conexão com o servidor...")

    try:
        response = requests.get("http://127.0.0.1:8000/docs")
        print(f"Status da documentação: {response.status_code}")
        if response.status_code == 200:
            print("✅ Servidor está respondendo!")
        else:
            print("❌ Servidor não está respondendo corretamente")
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

    print("\nTestando endpoint de saúde...")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Status root: {response.status_code}")
        print(f"Resposta: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Erro: {e}")

    print("\nTestando registro...")
    try:
        user_data = {
            "username": "teste",
            "email": "teste@teste.com",
            "password": "123456"
        }
        response = requests.post("http://127.0.0.1:8000/api/v1/register", json=user_data)
        print(f"Status registro: {response.status_code}")
        print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"❌ Erro no registro: {e}")

    print("\nTestando login...")
    try:
        login_data = {
            "username": "teste",
            "password": "123456"
        }
        response = requests.post("http://127.0.0.1:8000/api/v1/token", data=login_data)
        print(f"Status login: {response.status_code}")
        print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"❌ Erro no login: {e}")

if __name__ == "__main__":
    quick_test()
    show_solutions()
    print("\n" + "="*50)
    print("🔗 TESTE DE CONEXÃO COM SERVIDOR EXISTENTE")
    print("="*50)
    test_server_connection()