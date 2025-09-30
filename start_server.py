#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import subprocess
from pathlib import Path

# Adiciona o diretório atual ao path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

print("🔧 Configurando ambiente...")
print(f"📁 Diretório atual: {current_dir}")
print(f"🐍 Python: {sys.executable}")
print(f"📦 Versão Python: {sys.version}")

# Verifica se as dependências estão instaladas
try:
    import fastapi
    print("✅ FastAPI disponível")
except ImportError:
    print("❌ FastAPI não encontrado")
    sys.exit(1)

try:
    import uvicorn
    print("✅ Uvicorn disponível")
except ImportError:
    print("❌ Uvicorn não encontrado")
    sys.exit(1)

# Tenta importar o app
try:
    from minimal_server import app
    print("✅ App importado com sucesso")
except Exception as e:
    print(f"❌ Erro ao importar app: {e}")
    sys.exit(1)

print("\n🚀 Iniciando servidor...")
print("📖 Documentação: http://127.0.0.1:8000/docs")
print("🌐 API: http://127.0.0.1:8000")
print("\n⏹️  Para parar o servidor, pressione Ctrl+C")
print("="*50)

if __name__ == '__main__':
    try:
        uvicorn.run(
            "minimal_server:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)