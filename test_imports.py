#!/usr/bin/env python3
# -*- coding: utf-8 -*-

print("🔍 Testando importações...")

try:
    import fastapi
    print("✅ FastAPI importado com sucesso")
except ImportError as e:
    print(f"❌ Erro ao importar FastAPI: {e}")

try:
    import uvicorn
    print("✅ Uvicorn importado com sucesso")
except ImportError as e:
    print(f"❌ Erro ao importar Uvicorn: {e}")

try:
    import pydantic
    print("✅ Pydantic importado com sucesso")
except ImportError as e:
    print(f"❌ Erro ao importar Pydantic: {e}")

try:
    from src import auth
    print("✅ Módulo auth importado com sucesso")
except ImportError as e:
    print(f"❌ Erro ao importar módulo auth: {e}")

try:
    from simple_server import app
    print("✅ App do simple_server importado com sucesso")
    print(f"📱 Tipo do app: {type(app)}")
except ImportError as e:
    print(f"❌ Erro ao importar app do simple_server: {e}")
except Exception as e:
    print(f"❌ Erro geral ao importar simple_server: {e}")

print("\n🏁 Teste de importações concluído!")