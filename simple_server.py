from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uvicorn
import uuid
from datetime import timedelta
from src import auth
from src.auth import get_current_user_from_token, TokenData

app = FastAPI(title="Dungeon Keeper API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
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

# --- Modelos de Usuário ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Modelos de Personagem ---
class CharacterAttributes(BaseModel):
    strength: int = 10
    dexterity: int = 10
    constitution: int = 10
    intelligence: int = 10
    wisdom: int = 10
    charisma: int = 10

class CharacterBase(BaseModel):
    name: str
    race: str
    character_class: str
    level: int = 1
    attributes: CharacterAttributes = Field(default_factory=CharacterAttributes)
    
class CharacterCreate(CharacterBase):
    pass

class CharacterInDB(CharacterBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str

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

# Bancos de dados em memória
db_users: List[UserInDB] = []
db_characters: List[CharacterInDB] = []

# Função auxiliar para autenticar usuário
def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = next((u for u in db_users if u.username == username), None)
    if not user:
        return None
    if not auth.verify_password(password, user.hashed_password):
        return None
    return user

@app.get("/")
def root():
    return {"message": "Dungeon Keeper API está online!"}

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

# --- Endpoints de Autenticação ---
@app.post("/api/v1/register", response_model=UserBase)
def register_user(user_in: UserCreate):
    """Registra um novo usuário no sistema."""
    hashed_password = auth.get_password_hash(user_in.password)
    user_db = UserInDB(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db_users.append(user_db)
    print(f"Novo usuário registrado: {user_db.username}")
    return UserBase(username=user_db.username, email=user_db.email)

@app.post("/api/v1/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "user_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Endpoints de Personagem ---
@app.post("/api/v1/characters", response_model=CharacterInDB)
def create_character_for_current_user(
    character_in: CharacterCreate,
    current_user: TokenData = Depends(get_current_user_from_token)
):
    """Cria um novo personagem para o usuário atualmente logado."""
    character_db = CharacterInDB(
        **character_in.model_dump(),
        owner_id=current_user.user_id
    )
    db_characters.append(character_db)
    print(f"Usuário '{current_user.username}' criou o personagem: {character_db.name}")
    return character_db

@app.get("/api/v1/characters", response_model=List[CharacterInDB])
def get_user_characters(
    current_user: TokenData = Depends(get_current_user_from_token)
):
    """Retorna todos os personagens pertencentes ao usuário logado."""
    return [char for char in db_characters if char.owner_id == current_user.user_id]

if __name__ == "__main__":
    print("🚀 Iniciando Dungeon Keeper API...")
    print("📖 Documentação: http://127.0.0.1:8000/docs")
    print("🎯 Endpoints disponíveis:")
    print("   - POST /api/v1/register - Registrar usuário")
    print("   - POST /api/v1/token - Login")
    print("   - POST /api/v1/characters - Criar personagem")
    print("   - GET /api/v1/characters - Listar personagens")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)