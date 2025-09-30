#!/usr/bin/env python3
"""
Script de debug para testar as importações e funcionalidades.
"""

try:
    print("1. Testando importação do FastAPI...")
    from fastapi import FastAPI
    print("   ✓ FastAPI importado com sucesso")
    
    print("2. Testando importação do auth...")
    from src import auth
    print("   ✓ Módulo auth importado com sucesso")
    
    print("3. Testando importação do main...")
    from src.main import app
    print("   ✓ App importado com sucesso")
    
    print("4. Testando criação de token...")
    token = auth.create_access_token({"sub": "test", "user_id": "123"})
    print(f"   ✓ Token criado: {token[:20]}...")
    
    print("5. Testando decodificação de token...")
    from src.auth import TokenData
    print("   ✓ TokenData importado com sucesso")
    
    print("\n🎉 Todos os testes passaram! O servidor deve funcionar.")
    print("\nIniciando servidor...")
    
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
    
except Exception as e:
    print(f"❌ Erro encontrado: {e}")
    import traceback
    traceback.print_exc()