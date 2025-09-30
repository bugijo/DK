# -*- coding: utf-8 -*-
"""
Servidor FastAPI mínimo para teste de diagnóstico
Use: uvicorn minimal:app --host 127.0.0.1 --port 8001
"""

from fastapi import FastAPI

app = FastAPI(title="Minimal Test Server")

@app.get("/ping")
def ping():
    return {"pong": True}

@app.get("/health")
def health():
    return {"status": "healthy", "server": "minimal"}

@app.get("/")
def root():
    return {"message": "Minimal FastAPI server running"}