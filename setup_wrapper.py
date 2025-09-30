#!/usr/bin/env python3
"""
Script de configuração e instalação do Trae Wrapper API
Autor: Assistente AI
Versão: 1.0.0
"""

import os
import sys
import subprocess
import secrets
import shutil
from pathlib import Path

def print_step(step, message):
    """Imprime uma etapa com formatação"""
    print(f"\n[{step}] {message}")
    print("-" * 50)

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ é necessário")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detectado")

def install_dependencies():
    """Instala dependências necessárias"""
    dependencies = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "python-dotenv>=1.0.0",
        "aiohttp>=3.9.0",
        "pydantic>=2.5.0"
    ]
    
    print("📦 Instalando dependências...")
    for dep in dependencies:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"  ✅ {dep}")
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Erro ao instalar {dep}: {e}")
            return False
    return True

def generate_secure_token():
    """Gera um token seguro"""
    return secrets.token_urlsafe(32)

def create_env_file():
    """Cria arquivo .env.wrapper com configurações"""
    env_file = Path(".env.wrapper")
    
    if env_file.exists():
        response = input("\n⚠️ Arquivo .env.wrapper já existe. Sobrescrever? (s/N): ")
        if response.lower() != 's':
            print("📄 Mantendo arquivo existente")
            return
    
    # Gera token seguro
    secure_token = generate_secure_token()
    
    # Detecta caminho do Trae CLI
    trae_path = shutil.which("trae") or "trae"
    
    env_content = f"""# Configuração do Trae Wrapper API
# Gerado automaticamente em {os.path.basename(__file__)}

# Token de autenticação (MANTENHA SEGURO!)
TRAE_WRAPPER_TOKEN={secure_token}

# Hosts permitidos para acessar a API
ALLOWED_HOSTS=127.0.0.1,localhost

# Caminho para o executável do Trae CLI
TRAE_CLI_PATH={trae_path}

# Tempo máximo de execução para comandos (segundos)
MAX_EXECUTION_TIME=60

# Configurações do servidor
HOST=127.0.0.1
PORT=8000
LOG_LEVEL=INFO
"""
    
    with open(env_file, "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print(f"✅ Arquivo .env.wrapper criado")
    print(f"🔑 Token gerado: {secure_token[:16]}...")
    print("⚠️ IMPORTANTE: Mantenha este token seguro!")

def test_trae_cli():
    """Testa se o Trae CLI está acessível"""
    try:
        result = subprocess.run(["trae", "--version"], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ Trae CLI encontrado: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Trae CLI retornou erro: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ Trae CLI não encontrado no PATH")
        print("💡 Instale o Trae CLI ou configure TRAE_CLI_PATH no .env.wrapper")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Timeout ao testar Trae CLI")
        return False

def create_service_files():
    """Cria arquivos de serviço para diferentes sistemas"""
    # Serviço systemd (Linux)
    systemd_content = f"""[Unit]
Description=Trae Wrapper API
After=network.target

[Service]
Type=simple
User=trae
Group=trae
WorkingDirectory={os.getcwd()}
Environment=PATH=/usr/bin:/usr/local/bin
EnvironmentFile={os.getcwd()}/.env.wrapper
ExecStart={sys.executable} {os.getcwd()}/trae_wrapper.py
Restart=always
RestartSec=10
KillMode=mixed
TimeoutStopSec=30

# Logs
StandardOutput=journal
StandardError=journal
SyslogIdentifier=trae-wrapper

# Segurança
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths={os.getcwd()}

# Limites
LimitNOFILE=65536
MemoryMax=512M

[Install]
WantedBy=multi-user.target
"""
    
    with open("trae-wrapper.service", "w") as f:
        f.write(systemd_content)
    
    # Script PowerShell (Windows)
    ps_content = f"""# Script de instalação do Trae Wrapper como serviço Windows
# Execute como Administrador

$serviceName = "TraeWrapper"
$serviceDisplayName = "Trae Wrapper API"
$serviceDescription = "API wrapper para integração Trae IDE com Telegram Bot"
$pythonPath = "{sys.executable}"
$scriptPath = "{os.getcwd()}\\trae_wrapper.py"
$workingDir = "{os.getcwd()}"

# Para usar NSSM (recomendado)
if (Get-Command "nssm" -ErrorAction SilentlyContinue) {{
    Write-Host "📦 Instalando serviço com NSSM..."
    
    nssm install $serviceName $pythonPath $scriptPath
    nssm set $serviceName AppDirectory $workingDir
    nssm set $serviceName DisplayName $serviceDisplayName
    nssm set $serviceName Description $serviceDescription
    nssm set $serviceName Start SERVICE_AUTO_START
    nssm set $serviceName AppStdout "$workingDir\\logs\\wrapper_stdout.log"
    nssm set $serviceName AppStderr "$workingDir\\logs\\wrapper_stderr.log"
    nssm set $serviceName AppRotateFiles 1
    nssm set $serviceName AppRotateOnline 1
    nssm set $serviceName AppRotateBytes 10485760  # 10MB
    
    Write-Host "✅ Serviço instalado. Use: net start $serviceName"
}} else {{
    Write-Host "❌ NSSM não encontrado. Instale com: choco install nssm"
    Write-Host "💡 Ou use Task Scheduler como alternativa"
}}
"""
    
    with open("install_wrapper_service_windows.ps1", "w") as f:
        f.write(ps_content)
    
    print("✅ Arquivos de serviço criados:")
    print("  📄 trae-wrapper.service (Linux/systemd)")
    print("  📄 install_wrapper_service_windows.ps1 (Windows)")

def show_usage_instructions():
    """Mostra instruções de uso"""
    print("\n" + "=" * 60)
    print("🎉 CONFIGURAÇÃO CONCLUÍDA!")
    print("=" * 60)
    
    print("\n📋 PRÓXIMOS PASSOS:")
    print("\n1️⃣ Testar o wrapper:")
    print("   python trae_wrapper.py")
    
    print("\n2️⃣ Testar endpoints:")
    print("   curl http://localhost:8000/health")
    
    print("\n3️⃣ Configurar autenticação no bot:")
    print("   - Adicione o token do .env.wrapper ao seu bot")
    print("   - Configure TRAE_API_URL=http://localhost:8000")
    
    print("\n4️⃣ Instalar como serviço (opcional):")
    print("   Linux: sudo cp trae-wrapper.service /etc/systemd/system/")
    print("   Windows: Execute install_wrapper_service_windows.ps1 como Admin")
    
    print("\n🔒 SEGURANÇA:")
    print("   - Token gerado automaticamente")
    print("   - Acesso restrito a localhost")
    print("   - Logs com rotação automática")
    
    print("\n📚 DOCUMENTAÇÃO:")
    print("   - API Docs: http://localhost:8000/docs")
    print("   - Health Check: http://localhost:8000/health")
    print("   - Métricas: http://localhost:8000/metrics")

def main():
    """Função principal"""
    print("🚀 CONFIGURAÇÃO DO TRAE WRAPPER API")
    print("=" * 40)
    
    try:
        print_step("1/6", "Verificando Python")
        check_python_version()
        
        print_step("2/6", "Instalando dependências")
        if not install_dependencies():
            print("❌ Falha na instalação de dependências")
            sys.exit(1)
        
        print_step("3/6", "Testando Trae CLI")
        trae_available = test_trae_cli()
        if not trae_available:
            print("⚠️ Trae CLI não disponível, mas continuando...")
        
        print_step("4/6", "Criando arquivo de configuração")
        create_env_file()
        
        print_step("5/6", "Criando arquivos de serviço")
        create_service_files()
        
        print_step("6/6", "Finalizando")
        show_usage_instructions()
        
    except KeyboardInterrupt:
        print("\n\n❌ Configuração cancelada pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Erro durante configuração: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()