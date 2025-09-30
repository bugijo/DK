#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar diferentes servidores ASGI
"""

import subprocess
import time
import requests
import sys
import os

def test_server_response(port, server_name):
    """Testa se o servidor responde e permanece ativo"""
    base_url = f"http://127.0.0.1:{port}"
    
    print(f"\n=== Testando {server_name} na porta {port} ===")
    
    # Aguarda um pouco para o servidor iniciar
    time.sleep(2)
    
    try:
        # Primeira requisição
        print("1. Primeira requisição...")
        response = requests.get(f"{base_url}/ping", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        time.sleep(1)
        
        # Segunda requisição
        print("2. Segunda requisição...")
        response = requests.get(f"{base_url}/ping", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        print(f"   ✅ {server_name} funcionou corretamente!")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro com {server_name}: {e}")
        return False

def run_uvicorn_test():
    """Testa uvicorn padrão"""
    print("\n" + "="*50)
    print("TESTE 1: Uvicorn padrão")
    print("="*50)
    
    # Inicia uvicorn em background
    process = subprocess.Popen([
        sys.executable, "-m", "uvicorn", 
        "minimal:app", 
        "--host", "127.0.0.1", 
        "--port", "8001"
    ], cwd=os.getcwd())
    
    try:
        success = test_server_response(8001, "Uvicorn")
        return success
    finally:
        process.terminate()
        process.wait()

def run_hypercorn_test():
    """Testa hypercorn"""
    print("\n" + "="*50)
    print("TESTE 2: Hypercorn")
    print("="*50)
    
    try:
        # Verifica se hypercorn está instalado
        subprocess.run([sys.executable, "-c", "import hypercorn"], 
                      check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("Hypercorn não está instalado. Instalando...")
        subprocess.run([sys.executable, "-m", "pip", "install", "hypercorn"], 
                      check=True)
    
    # Inicia hypercorn em background
    process = subprocess.Popen([
        sys.executable, "-m", "hypercorn", 
        "minimal:app", 
        "--bind", "127.0.0.1:8002"
    ], cwd=os.getcwd())
    
    try:
        success = test_server_response(8002, "Hypercorn")
        return success
    finally:
        process.terminate()
        process.wait()

def run_gunicorn_test():
    """Testa gunicorn com uvicorn workers"""
    print("\n" + "="*50)
    print("TESTE 3: Gunicorn + Uvicorn Workers")
    print("="*50)
    
    try:
        # Verifica se gunicorn está instalado
        subprocess.run([sys.executable, "-c", "import gunicorn"], 
                      check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("Gunicorn não está instalado. Instalando...")
        subprocess.run([sys.executable, "-m", "pip", "install", "gunicorn"], 
                      check=True)
    
    # Inicia gunicorn em background
    process = subprocess.Popen([
        sys.executable, "-m", "gunicorn", 
        "-k", "uvicorn.workers.UvicornWorker",
        "minimal:app", 
        "--bind", "127.0.0.1:8003"
    ], cwd=os.getcwd())
    
    try:
        success = test_server_response(8003, "Gunicorn+Uvicorn")
        return success
    finally:
        process.terminate()
        process.wait()

def main():
    print("🔍 DIAGNÓSTICO: Testando diferentes servidores ASGI")
    print("Objetivo: Identificar se o problema é específico do uvicorn ou geral")
    
    results = []
    
    # Teste 1: Uvicorn
    results.append(("Uvicorn", run_uvicorn_test()))
    
    # Teste 2: Hypercorn
    results.append(("Hypercorn", run_hypercorn_test()))
    
    # Teste 3: Gunicorn
    results.append(("Gunicorn+Uvicorn", run_gunicorn_test()))
    
    # Resumo
    print("\n" + "="*50)
    print("RESUMO DOS TESTES")
    print("="*50)
    
    for server, success in results:
        status = "✅ FUNCIONOU" if success else "❌ FALHOU"
        print(f"{server:20} {status}")
    
    # Análise
    print("\n" + "="*50)
    print("ANÁLISE")
    print("="*50)
    
    failed_count = sum(1 for _, success in results if not success)
    
    if failed_count == len(results):
        print("❌ TODOS os servidores falharam!")
        print("   Isso indica um problema no AMBIENTE:")
        print("   - Instalação do Python")
        print("   - Dependências corrompidas")
        print("   - Antivírus/Firewall")
        print("   - Configuração do sistema")
    elif failed_count == 0:
        print("✅ TODOS os servidores funcionaram!")
        print("   O problema está no seu código wrapper original.")
    else:
        print(f"⚠️  {failed_count} de {len(results)} servidores falharam.")
        print("   Problema parcial - pode ser específico do uvicorn.")

if __name__ == "__main__":
    main()