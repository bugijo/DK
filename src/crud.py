# src/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash
from typing import Optional
import uuid

# --- FUNÇÕES CRUD PARA USUÁRIOS ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- FUNÇÕES CRUD PARA MESAS ---
def get_tables(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Table).offset(skip).limit(limit).all()

def create_table(db: Session, table: schemas.TableCreate, master_id: str):
    db_table = models.Table(
        id=str(uuid.uuid4()),
        title=table.title,
        description=table.description,
        master_id=master_id,
        story_id=table.story_id
    )
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

# --- FUNÇÕES CRUD PARA PERSONAGENS ---
def get_characters_by_owner(db: Session, owner_id: str):
    return db.query(models.Character).filter(models.Character.owner_id == owner_id).all()

def create_character_for_user(db: Session, character: schemas.CharacterCreate, owner_id: str):
    db_character = models.Character(**character.model_dump(), owner_id=owner_id, id=str(uuid.uuid4()))
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character

def get_character_by_id(db: Session, character_id: str, owner_id: str):
    """Busca um personagem específico, garantindo que ele pertença ao usuário."""
    return db.query(models.Character).filter(models.Character.id == character_id, models.Character.owner_id == owner_id).first()

def update_user_character(db: Session, character_id: str, character_update: schemas.CharacterUpdate, owner_id: str):
    """Atualiza um personagem específico, se pertencer ao usuário."""
    db_character = get_character_by_id(db, character_id=character_id, owner_id=owner_id)
    if db_character:
        update_data = character_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_character, key, value)
        db.commit()
        db.refresh(db_character)
    return db_character

def delete_user_character(db: Session, character_id: str, owner_id: str):
    """Deleta um personagem específico, se pertencer ao usuário."""
    db_character = get_character_by_id(db, character_id=character_id, owner_id=owner_id)
    if db_character:
        db.delete(db_character)
        db.commit()
        return True
    return False

# --- FUNÇÕES CRUD PARA ITENS ---
def get_user_items(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Item).filter(models.Item.creator_id == user_id).offset(skip).limit(limit).all()

def create_user_item(db: Session, item: schemas.ItemCreate, user_id: str):
    db_item = models.Item(**item.model_dump(), creator_id=user_id, id=str(uuid.uuid4()))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# --- FUNÇÕES CRUD PARA MONSTROS ---
def get_user_monsters(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Monster).filter(models.Monster.creator_id == user_id).offset(skip).limit(limit).all()

def create_monster_for_user(db: Session, monster: schemas.MonsterCreate, user_id: str):
    db_monster = models.Monster(**monster.model_dump(), creator_id=user_id, id=str(uuid.uuid4()))
    db.add(db_monster)
    db.commit()
    db.refresh(db_monster)
    return db_monster

# --- FUNÇÕES CRUD PARA NPCS ---
def get_user_npcs(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.NPC).filter(models.NPC.creator_id == user_id).offset(skip).limit(limit).all()

def create_npc_for_user(db: Session, npc: schemas.NPCCreate, user_id: str):
    db_npc = models.NPC(**npc.model_dump(), creator_id=user_id, id=str(uuid.uuid4()))
    db.add(db_npc)
    db.commit()
    db.refresh(db_npc)
    return db_npc

# --- FUNÇÕES CRUD PARA HISTÓRIAS ---
def get_user_stories(db: Session, user_id: str):
    return db.query(models.Story).filter(models.Story.creator_id == user_id).all()

def create_story_for_user(db: Session, story_data: schemas.StoryCreate, user_id: str):
    db_story = models.Story(
        id=str(uuid.uuid4()),
        title=story_data.title,
        synopsis=story_data.synopsis,
        creator_id=user_id
    )
    
    # Associa os itens, monstros e NPCs existentes
    db_story.items = db.query(models.Item).filter(models.Item.id.in_(story_data.item_ids)).all()
    db_story.monsters = db.query(models.Monster).filter(models.Monster.id.in_(story_data.monster_ids)).all()
    db_story.npcs = db.query(models.NPC).filter(models.NPC.id.in_(story_data.npc_ids)).all()
    
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story

# --- FUNÇÕES CRUD PARA SOLICITAÇÕES DE ENTRADA EM MESAS ---
def create_join_request(db: Session, table_id: str, user_id: str, character_id: str, message: str = None):
    # Verifica se já não existe um pedido pendente ou se o usuário já está na mesa
    existing_request = db.query(models.JoinRequest).filter(
        models.JoinRequest.table_id == table_id,
        models.JoinRequest.user_id == user_id,
        models.JoinRequest.status == "pending"
    ).first()
    
    if existing_request:
        return None  # Já existe uma solicitação pendente
    
    # Verifica se o usuário já é jogador da mesa
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if table and any(player.id == user_id for player in table.players):
        return None  # Usuário já é jogador da mesa
    
    db_request = models.JoinRequest(
        id=str(uuid.uuid4()),
        table_id=table_id,
        user_id=user_id,
        character_id=character_id,
        message=message,
        status="pending"
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def manage_join_request(db: Session, request_id: str, new_status: str):
    db_request = db.query(models.JoinRequest).filter(models.JoinRequest.id == request_id).first()
    if not db_request:
        return None
    
    db_request.status = new_status
    
    if new_status == "approved":
        # Se aprovado, adiciona o usuário à lista de jogadores da mesa
        table = db.query(models.Table).filter(models.Table.id == db_request.table_id).first()
        user = db.query(models.User).filter(models.User.id == db_request.user_id).first()
        if table and user:
            table.players.append(user)
    
    db.commit()
    db.refresh(db_request)
    return db_request

def get_table_join_requests(db: Session, table_id: str):
    return db.query(models.JoinRequest).filter(
        models.JoinRequest.table_id == table_id,
        models.JoinRequest.status == "pending"
    ).all()

# NOVA FUNÇÃO para atualizar um usuário
def update_user(db: Session, user_id: str, user_update: schemas.UserUpdate | schemas.NotificationSettingsUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        # exclude_unset=True é a chave! Garante que só atualizemos os campos enviados.
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

# --- NOVAS FUNÇÕES CRUD PARA ITENS ---

def get_item_by_id(db: Session, item_id: str, user_id: str):
    """Busca um item específico, garantindo que ele pertença ao usuário."""
    return db.query(models.Item).filter(models.Item.id == item_id, models.Item.creator_id == user_id).first()

def update_user_item(db: Session, item_id: str, item_update: schemas.ItemUpdate, user_id: str):
    """Atualiza um item específico, se pertencer ao usuário."""
    db_item = get_item_by_id(db, item_id=item_id, user_id=user_id)
    if db_item:
        update_data = item_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_user_item(db: Session, item_id: str, user_id: str):
    """Deleta um item específico, se pertencer ao usuário."""
    db_item = get_item_by_id(db, item_id=item_id, user_id=user_id)
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

# --- NOVAS FUNÇÕES CRUD PARA MONSTROS ---

def get_monster_by_id(db: Session, monster_id: str, user_id: str):
    """Busca um monstro específico, garantindo que ele pertença ao usuário."""
    return db.query(models.Monster).filter(models.Monster.id == monster_id, models.Monster.creator_id == user_id).first()

def update_user_monster(db: Session, monster_id: str, monster_update: schemas.MonsterUpdate, user_id: str):
    """Atualiza um monstro específico, se pertencer ao usuário."""
    db_monster = get_monster_by_id(db, monster_id=monster_id, user_id=user_id)
    if db_monster:
        update_data = monster_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_monster, key, value)
        db.commit()
        db.refresh(db_monster)
    return db_monster

def delete_user_monster(db: Session, monster_id: str, user_id: str):
    """Deleta um monstro específico, se pertencer ao usuário."""
    db_monster = get_monster_by_id(db, monster_id=monster_id, user_id=user_id)
    if db_monster:
        db.delete(db_monster)
        db.commit()
        return True
    return False

# --- NOVAS FUNÇÕES CRUD PARA NPCS ---

def get_npc_by_id(db: Session, npc_id: str, user_id: str):
    """Busca um NPC específico, garantindo que ele pertença ao usuário."""
    return db.query(models.NPC).filter(models.NPC.id == npc_id, models.NPC.creator_id == user_id).first()

def update_user_npc(db: Session, npc_id: str, npc_update: schemas.NPCUpdate, user_id: str):
    """Atualiza um NPC específico, se pertencer ao usuário."""
    db_npc = get_npc_by_id(db, npc_id=npc_id, user_id=user_id)
    if db_npc:
        update_data = npc_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_npc, key, value)
        db.commit()
        db.refresh(db_npc)
    return db_npc

def delete_user_npc(db: Session, npc_id: str, user_id: str):
    """Deleta um NPC específico, se pertencer ao usuário."""
    db_npc = get_npc_by_id(db, npc_id=npc_id, user_id=user_id)
    if db_npc:
        db.delete(db_npc)
        db.commit()
        return True
    return False

# --- NOVAS FUNÇÕES CRUD PARA HISTÓRIAS ---

def get_story_by_id(db: Session, story_id: str, user_id: str):
    """Busca uma história específica, garantindo que ela pertença ao usuário."""
    return db.query(models.Story).filter(models.Story.id == story_id, models.Story.creator_id == user_id).first()

def update_user_story(db: Session, story_id: str, story_update: schemas.StoryUpdate, user_id: str):
    """Atualiza uma história específica, incluindo suas associações com itens, monstros e NPCs."""
    db_story = get_story_by_id(db, story_id=story_id, user_id=user_id)
    if not db_story:
        return None
    
    # Atualiza campos simples (título, sinopse)
    update_data = story_update.model_dump(exclude_unset=True, exclude={'item_ids', 'monster_ids', 'npc_ids'})
    for key, value in update_data.items():
        setattr(db_story, key, value)
    
    # Atualiza associações se fornecidas
    if story_update.item_ids is not None:
        db_story.items = db.query(models.Item).filter(
            models.Item.id.in_(story_update.item_ids),
            models.Item.creator_id == user_id
        ).all()
    
    if story_update.monster_ids is not None:
        db_story.monsters = db.query(models.Monster).filter(
            models.Monster.id.in_(story_update.monster_ids),
            models.Monster.creator_id == user_id
        ).all()
    
    if story_update.npc_ids is not None:
        db_story.npcs = db.query(models.NPC).filter(
            models.NPC.id.in_(story_update.npc_ids),
            models.NPC.creator_id == user_id
        ).all()
    
    db.commit()
    db.refresh(db_story)
    return db_story

def delete_user_story(db: Session, story_id: str, user_id: str):
    """Deleta uma história específica, se pertencer ao usuário."""
    db_story = get_story_by_id(db, story_id=story_id, user_id=user_id)
    if db_story:
        db.delete(db_story)
        db.commit()
        return True
    return False

# --- FUNÇÃO CRUD PARA ATUALIZAR ESTADO DOS TOKENS ---
def update_table_tokens_state(db: Session, table_id: str, tokens_state: list[schemas.TokenState]):
    """Atualiza o estado dos tokens de uma mesa específica."""
    db_table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if db_table:
        db_table.tokens_state = [token.model_dump() for token in tokens_state]
        db.commit()
        db.refresh(db_table)
    return db_table