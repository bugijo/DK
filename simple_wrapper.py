# -*- coding: utf-8 -*-
"""
Wrapper super simples para testar
"""

from fastapi import FastAPI
import uvicorn
import os

app = FastAPI(title="Simple Trae Wrapper")

@app.get("/")
async def root():
    return {"message": "Simple wrapper running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Simple Trae Wrapper"
    }

@app.post("/trae-command")
async def execute_command(data: dict):
    return {
        "result": "Command received",
        "command": data.get("command", "unknown"),
        "status": "success"
    }

if __name__ == "__main__":
    print("Starting simple wrapper...")
    uvicorn.run(
        "simple_wrapper:app",
        host="127.0.0.1",
        port=8002,
        log_level="info"
    )