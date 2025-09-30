#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI(title="Dungeon Keeper API - Minimal")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Table(BaseModel):
    id: str
    title: str
    master: str
    description: str
    maxPlayers: int
    system: str = "D&D 5e"

# Dados de teste
tables = [
    {
        "id": "1",
        "title": "A Mina Perdida de Phandelver",
        "master": "Gandalf",
        "description": "Uma aventura clássica para iniciantes.",
        "maxPlayers": 5,
        "system": "D&D 5e"
    },
    {
        "id": "2",
        "title": "Curse of Strahd",
        "master": "Elminster",
        "description": "Terror gótico nas terras de Barovia.",
        "maxPlayers": 4,
        "system": "D&D 5e"
    }
]

@app.get("/")
def root():
    return {"message": "Dungeon Keeper API está online! 🎲"}

@app.get("/api/v1/tables")
def get_tables():
    return tables

@app.post("/api/v1/tables")
def create_table(table: dict):
    new_table = {
        "id": str(len(tables) + 1),
        "title": table.get("title", "Nova Mesa"),
        "master": table.get("master", "Mestre"),
        "description": table.get("description", "Descrição da mesa"),
        "maxPlayers": table.get("maxPlayers", 4),
        "system": table.get("system", "D&D 5e")
    }
    tables.append(new_table)
    return new_table

if __name__ == "__main__":
    print("🚀 Iniciando Dungeon Keeper API (Minimal)...")
    print("📖 Documentação: http://127.0.0.1:8000/docs")
    print("🎯 Endpoints disponíveis:")
    print("   - GET / - Status da API")
    print("   - GET /api/v1/tables - Listar mesas")
    print("   - POST /api/v1/tables - Criar mesa")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)