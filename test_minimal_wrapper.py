# -*- coding: utf-8 -*-
"""
Servidor mínimo para testar se o problema está no wrapper principal
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Test Minimal Wrapper")

@app.get("/")
async def root():
    return {"message": "Test server running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)