#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para diagnosticar problemas no ambiente Python
"""

import sys
import os
import subprocess
import platform
import socket
import threading
import time

def check_python_info():
    """Verifica informações básicas do Python"""
    print("=== INFORMAÇÕES DO PYTHON ===")
    print(f"Versão: {sys.version}")
    print(f"Executável: {sys.executable}")
    print(f"Plataforma: {platform.platform()}")
    print(f"Arquitetura: {platform.architecture()}")
    print(f"Path do Python: {sys.path[:3]}...")  # Primeiros 3 paths
    print()

def check_virtual_env():
    """Verifica se está em ambiente virtual"""
    print("=== AMBIENTE VIRTUAL ===")
    venv = os.environ.get('VIRTUAL_ENV')
    if venv:
        print(f"✅ Ambiente virtual ativo: {venv}")
    else:
        print("❌ Nenhum ambiente virtual detectado")
    
    conda_env = os.environ.get('CONDA_DEFAULT_ENV')
    if conda_env:
        print(f"✅ Ambiente Conda: {conda_env}")
    print()

def check_packages():
    """Verifica pacotes instalados"""
    print("=== PACOTES RELEVANTES ===")
    packages = ['fastapi', 'uvicorn', 'requests', 'pydantic']
    
    for package in packages:
        try:
            result = subprocess.run(
                [sys.executable, '-c', f'import {package}; print({package}.__version__)'],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                print(f"✅ {package}: {version}")
            else:
                print(f"❌ {package}: Erro ao importar")
        except Exception as e:
            print(f"❌ {package}: {e}")
    print()

def check_port_availability():
    """Verifica se as portas estão disponíveis"""
    print("=== DISPONIBILIDADE DE PORTAS ===")
    ports = [8000, 8001, 8002, 8003]
    
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            result = sock.connect_ex(('127.0.0.1', port))
            if result == 0:
                print(f"❌ Porta {port}: EM USO")
            else:
                print(f"✅ Porta {port}: DISPONÍVEL")
        except Exception as e:
            print(f"⚠️  Porta {port}: Erro ao verificar - {e}")
        finally:
            sock.close()
    print()

def test_simple_socket_server():
    """Testa um servidor socket simples para verificar se o problema é do Python"""
    print("=== TESTE DE SERVIDOR SOCKET SIMPLES ===")
    
    def simple_server():
        try:
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_socket.bind(('127.0.0.1', 9999))
            server_socket.listen(1)
            print("   Servidor socket iniciado na porta 9999")
            
            # Aceita uma conexão
            client_socket, addr = server_socket.accept()
            print(f"   Conexão recebida de {addr}")
            
            # Envia resposta HTTP simples
            response = "HTTP/1.1 200 OK\r\nContent-Length: 13\r\n\r\nHello, World!"
            client_socket.send(response.encode())
            client_socket.close()
            
            # Aceita segunda conexão para testar persistência
            client_socket, addr = server_socket.accept()
            print(f"   Segunda conexão recebida de {addr}")
            client_socket.send(response.encode())
            client_socket.close()
            
            server_socket.close()
            print("   ✅ Servidor socket funcionou corretamente!")
            
        except Exception as e:
            print(f"   ❌ Erro no servidor socket: {e}")
    
    # Inicia servidor em thread
    server_thread = threading.Thread(target=simple_server)
    server_thread.start()
    
    # Aguarda servidor iniciar
    time.sleep(1)
    
    # Testa conexões
    try:
        import requests
        
        print("   Testando primeira requisição...")
        response = requests.get('http://127.0.0.1:9999', timeout=5)
        print(f"   Primeira resposta: {response.status_code}")
        
        print("   Testando segunda requisição...")
        response = requests.get('http://127.0.0.1:9999', timeout=5)
        print(f"   Segunda resposta: {response.status_code}")
        
    except Exception as e:
        print(f"   ❌ Erro ao testar requisições: {e}")
    
    server_thread.join()
    print()

def check_firewall_antivirus():
    """Verifica possíveis interferências de firewall/antivírus"""
    print("=== VERIFICAÇÕES DE SEGURANÇA ===")
    
    # Verifica Windows Defender
    try:
        result = subprocess.run(
            ['powershell', '-Command', 'Get-MpPreference | Select-Object -Property DisableRealtimeMonitoring'],
            capture_output=True, text=True, timeout=10
        )
        if 'False' in result.stdout:
            print("⚠️  Windows Defender ativo (pode interferir)")
        else:
            print("✅ Windows Defender não está bloqueando")
    except:
        print("❓ Não foi possível verificar Windows Defender")
    
    # Verifica processos que podem interferir
    suspicious_processes = ['avast', 'norton', 'mcafee', 'kaspersky', 'bitdefender']
    try:
        result = subprocess.run(['tasklist'], capture_output=True, text=True)
        running_processes = result.stdout.lower()
        
        found_av = []
        for av in suspicious_processes:
            if av in running_processes:
                found_av.append(av)
        
        if found_av:
            print(f"⚠️  Antivírus detectados: {', '.join(found_av)}")
        else:
            print("✅ Nenhum antivírus conhecido detectado")
            
    except:
        print("❓ Não foi possível verificar processos")
    
    print()

def main():
    print("🔍 DIAGNÓSTICO COMPLETO DO AMBIENTE")
    print("="*60)
    
    check_python_info()
    check_virtual_env()
    check_packages()
    check_port_availability()
    test_simple_socket_server()
    check_firewall_antivirus()
    
    print("="*60)
    print("PRÓXIMOS PASSOS RECOMENDADOS:")
    print("1. Se o servidor socket simples falhou: problema no ambiente Python")
    print("2. Se apenas FastAPI/Uvicorn falham: problema nas dependências")
    print("3. Se antivírus detectado: temporariamente desabilitar para teste")
    print("4. Considerar recriar ambiente virtual do zero")
    print("5. Testar em container Docker para isolar o ambiente")

if __name__ == "__main__":
    main()