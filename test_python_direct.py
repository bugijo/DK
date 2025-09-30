#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste direto do Python para verificar se o problema é do ambiente
"""

import sys
import subprocess
import os
import time

def test_python_installation():
    """Testa a instalação básica do Python"""
    print("=== TESTE DA INSTALAÇÃO DO PYTHON ===")
    print(f"Versão: {sys.version}")
    print(f"Executável: {sys.executable}")
    print(f"Path: {sys.path[0]}")
    
    # Testa importações básicas
    try:
        import socket
        print("✅ Socket: OK")
    except Exception as e:
        print(f"❌ Socket: {e}")
        return False
    
    try:
        import threading
        print("✅ Threading: OK")
    except Exception as e:
        print(f"❌ Threading: {e}")
        return False
    
    return True

def test_pip_install():
    """Testa instalação via pip em diretório temporário"""
    print("\n=== TESTE DE INSTALAÇÃO VIA PIP ===")
    
    try:
        # Cria diretório temporário para teste
        test_dir = "temp_test_env"
        if os.path.exists(test_dir):
            import shutil
            shutil.rmtree(test_dir)
        
        # Cria ambiente virtual temporário
        print("Criando ambiente temporário...")
        result = subprocess.run([
            sys.executable, "-m", "venv", test_dir
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            print(f"❌ Falha ao criar venv: {result.stderr}")
            return False
        
        print("✅ Ambiente virtual criado")
        
        # Testa ativação e instalação
        if os.name == 'nt':  # Windows
            pip_path = os.path.join(test_dir, "Scripts", "pip.exe")
            python_path = os.path.join(test_dir, "Scripts", "python.exe")
        else:
            pip_path = os.path.join(test_dir, "bin", "pip")
            python_path = os.path.join(test_dir, "bin", "python")
        
        # Instala fastapi
        print("Instalando FastAPI...")
        result = subprocess.run([
            pip_path, "install", "fastapi", "uvicorn[standard]"
        ], capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            print(f"❌ Falha ao instalar: {result.stderr}")
            return False
        
        print("✅ FastAPI instalado")
        
        # Testa importação
        print("Testando importação...")
        result = subprocess.run([
            python_path, "-c", "import fastapi; import uvicorn; print('OK')"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            print(f"❌ Falha ao importar: {result.stderr}")
            return False
        
        print("✅ Importação funcionou")
        
        # Limpa ambiente temporário
        import shutil
        shutil.rmtree(test_dir)
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste: {e}")
        return False

def test_socket_server():
    """Testa servidor socket básico"""
    print("\n=== TESTE DE SERVIDOR SOCKET ===")
    
    try:
        import socket
        import threading
        
        def server_thread():
            server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server.bind(('127.0.0.1', 9998))
            server.listen(1)
            
            # Aceita primeira conexão
            conn, addr = server.accept()
            conn.send(b"HTTP/1.1 200 OK\r\n\r\nOK1")
            conn.close()
            
            # Aceita segunda conexão
            conn, addr = server.accept()
            conn.send(b"HTTP/1.1 200 OK\r\n\r\nOK2")
            conn.close()
            
            server.close()
        
        # Inicia servidor
        thread = threading.Thread(target=server_thread)
        thread.start()
        
        time.sleep(0.5)
        
        # Testa primeira conexão
        client1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client1.connect(('127.0.0.1', 9998))
        response1 = client1.recv(1024).decode()
        client1.close()
        
        # Testa segunda conexão
        client2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client2.connect(('127.0.0.1', 9998))
        response2 = client2.recv(1024).decode()
        client2.close()
        
        thread.join()
        
        if "OK1" in response1 and "OK2" in response2:
            print("✅ Servidor socket funcionou")
            return True
        else:
            print(f"❌ Respostas incorretas: {response1}, {response2}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no servidor socket: {e}")
        return False

def main():
    print("🔍 TESTE DIRETO DO AMBIENTE PYTHON")
    print("="*50)
    
    results = []
    
    # Teste 1: Instalação básica
    results.append(("Instalação Python", test_python_installation()))
    
    # Teste 2: Pip e venv
    results.append(("Pip/Venv", test_pip_install()))
    
    # Teste 3: Socket básico
    results.append(("Socket Server", test_socket_server()))
    
    # Resumo
    print("\n" + "="*50)
    print("RESUMO DOS TESTES")
    print("="*50)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        print(f"{test_name:20} {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*50)
    if all_passed:
        print("✅ TODOS OS TESTES PASSARAM")
        print("O problema NÃO é do ambiente Python básico.")
        print("Recomendação: Verificar configurações específicas do FastAPI/Uvicorn")
    else:
        print("❌ ALGUNS TESTES FALHARAM")
        print("O problema É do ambiente Python.")
        print("Recomendação: Reinstalar Python ou usar Docker")

if __name__ == "__main__":
    main()