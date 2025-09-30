# src/schemas.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any
from datetime import datetime
import uuid

# --- Schema para Token do Mapa Tático ---
class TokenState(BaseModel):
    id: str
    imageUrl: str
    x: int
    y: int
    size: int  # ex: 1 (para 1x1 grid), 2 (para 2x2 grid)
    label: str

# --- Schema para Recuperação de Senha ---
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# --- Schemas de Personagem ---
class CharacterBase(BaseModel):
    name: str
    race: str
    character_class: str
    level: int = 1
    background: Optional[str] = None
    alignment: Optional[str] = None
    
    # Atributos básicos
    strength: int = 10
    dexterity: int = 10
    constitution: int = 10
    intelligence: int = 10
    wisdom: int = 10
    charisma: int = 10
    
    # Pontos de vida e defesa
    hit_points: int = 8
    max_hit_points: int = 8
    armor_class: int = 10
    
    # Informações narrativas
    backstory: Optional[str] = None
    personality_traits: Optional[str] = None
    ideals: Optional[str] = None
    bonds: Optional[str] = None
    flaws: Optional[str] = None
    
    # Equipamentos e notas
    equipment: Optional[List[str]] = []
    notes: Optional[str] = None

class CharacterCreate(CharacterBase):
    pass

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    race: Optional[str] = None
    character_class: Optional[str] = None
    level: Optional[int] = None
    background: Optional[str] = None
    alignment: Optional[str] = None
    
    # Atributos básicos
    strength: Optional[int] = None
    dexterity: Optional[int] = None
    constitution: Optional[int] = None
    intelligence: Optional[int] = None
    wisdom: Optional[int] = None
    charisma: Optional[int] = None
    
    # Pontos de vida e defesa
    hit_points: Optional[int] = None
    max_hit_points: Optional[int] = None
    armor_class: Optional[int] = None
    
    # Informações narrativas
    backstory: Optional[str] = None
    personality_traits: Optional[str] = None
    ideals: Optional[str] = None
    bonds: Optional[str] = None
    flaws: Optional[str] = None
    
    # Equipamentos e notas
    equipment: Optional[List[str]] = None
    notes: Optional[str] = None

class Character(CharacterBase):
    id: str
    owner_id: str
    
    class Config:
        from_attributes = True

# --- Schemas de Mesa ---
class TableBase(BaseModel):
    title: str
    description: Optional[str] = None
    max_players: int = 6
    min_character_level: Optional[int] = None
    max_character_level: Optional[int] = None
    scheduled_date: Optional[datetime] = None
    location: Optional[str] = None
    campaign_description: Optional[str] = None
    
class TableCreate(TableBase):
    story_id: str

class Table(TableBase):
    id: str
    master_id: str
    story_id: Optional[str] = None
    map_image_url: Optional[str] = None
    tokens_state: Optional[List[TokenState]] = []
    is_active: bool = True
    story: Optional['Story'] = None
    players: List['UserBase'] = []
    join_requests: List['JoinRequest'] = []
    
    class Config:
        from_attributes = True

# --- Schemas de Item ---
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "Mundane"
    rarity: str = "Common"
    image_url: Optional[str] = None
    price: Optional[int] = 0

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    rarity: Optional[str] = None

class Item(ItemBase):
    id: str
    creator_id: str
    
    class Config:
        from_attributes = True

# --- Schemas de Monster ---
class MonsterBase(BaseModel):
    name: str
    size: str
    type: str
    armor_class: int
    hit_points: str
    speed: str
    
    # Atributos D&D 5e
    strength: int = 10
    dexterity: int = 10
    constitution: int = 10
    intelligence: int = 10
    wisdom: int = 10
    charisma: int = 10
    
    # Proficiências e resistências
    saving_throws: Optional[str] = None
    skills: Optional[str] = None
    damage_resistances: Optional[str] = None
    damage_immunities: Optional[str] = None
    condition_immunities: Optional[str] = None
    senses: Optional[str] = None
    languages: Optional[str] = None
    
    # Habilidades e ações
    special_abilities: Optional[str] = None
    actions: Optional[str] = None
    legendary_actions: Optional[str] = None
    reactions: Optional[str] = None
    
    challenge_rating: str
    experience_points: int = 0
    
    # Informações adicionais
    description: Optional[str] = None
    environment: Optional[str] = None

class MonsterCreate(MonsterBase):
    pass

class MonsterUpdate(BaseModel):
    name: Optional[str] = None
    size: Optional[str] = None
    type: Optional[str] = None
    armor_class: Optional[int] = None
    hit_points: Optional[str] = None
    speed: Optional[str] = None
    
    # Atributos D&D 5e
    strength: Optional[int] = None
    dexterity: Optional[int] = None
    constitution: Optional[int] = None
    intelligence: Optional[int] = None
    wisdom: Optional[int] = None
    charisma: Optional[int] = None
    
    # Proficiências e resistências
    saving_throws: Optional[str] = None
    skills: Optional[str] = None
    damage_resistances: Optional[str] = None
    damage_immunities: Optional[str] = None
    condition_immunities: Optional[str] = None
    senses: Optional[str] = None
    languages: Optional[str] = None
    
    # Habilidades e ações
    special_abilities: Optional[str] = None
    actions: Optional[str] = None
    legendary_actions: Optional[str] = None
    reactions: Optional[str] = None
    
    challenge_rating: Optional[str] = None
    experience_points: Optional[int] = None
    
    # Informações adicionais
    description: Optional[str] = None
    environment: Optional[str] = None

class Monster(MonsterBase):
    id: str
    creator_id: str
    
    class Config:
        from_attributes = True

# --- Schemas de NPC ---
class NPCBase(BaseModel):
    name: str
    
    # Informações básicas
    race: Optional[str] = "Humano"
    character_class: Optional[str] = "Cidadão"
    level: int = 1
    size: str = "Medium"
    alignment: Optional[str] = "Neutro"
    armor_class: int = 10
    hit_points: str = "4 (1d8)"
    speed: str = "30 ft."
    
    # Atributos D&D 5e
    strength: int = 10
    dexterity: int = 10
    constitution: int = 10
    intelligence: int = 10
    wisdom: int = 10
    charisma: int = 10
    
    # Proficiências e habilidades
    saving_throws: Optional[str] = None
    skills: Optional[str] = None
    damage_resistances: Optional[str] = None
    damage_immunities: Optional[str] = None
    condition_immunities: Optional[str] = None
    senses: Optional[str] = None
    languages: Optional[str] = "Common"
    
    # Personalidade e interpretação
    personality_traits: Optional[str] = None
    ideals: Optional[str] = None
    bonds: Optional[str] = None
    flaws: Optional[str] = None
    
    # Habilidades e ações
    special_abilities: Optional[str] = None
    actions: Optional[str] = None
    reactions: Optional[str] = None
    equipment: Optional[List[str]] = []
    
    # Informações narrativas
    description: Optional[str] = None
    backstory: Optional[str] = None
    role: Optional[str] = "Cidadão"
    location: Optional[str] = None
    faction: Optional[str] = None
    
    # Informações de jogo
    challenge_rating: str = "0"
    experience_points: int = 0
    
    # Notas do mestre
    notes: Optional[str] = None
    quest_hooks: Optional[str] = None

class NPCCreate(NPCBase):
    pass

class NPCUpdate(BaseModel):
    name: Optional[str] = None
    
    # Informações básicas
    race: Optional[str] = None
    character_class: Optional[str] = None
    level: Optional[int] = None
    size: Optional[str] = None
    alignment: Optional[str] = None
    armor_class: Optional[int] = None
    hit_points: Optional[str] = None
    speed: Optional[str] = None
    
    # Atributos D&D 5e
    strength: Optional[int] = None
    dexterity: Optional[int] = None
    constitution: Optional[int] = None
    intelligence: Optional[int] = None
    wisdom: Optional[int] = None
    charisma: Optional[int] = None
    
    # Proficiências e habilidades
    saving_throws: Optional[str] = None
    skills: Optional[str] = None
    damage_resistances: Optional[str] = None
    damage_immunities: Optional[str] = None
    condition_immunities: Optional[str] = None
    senses: Optional[str] = None
    languages: Optional[str] = None
    
    # Personalidade e interpretação
    personality_traits: Optional[str] = None
    ideals: Optional[str] = None
    bonds: Optional[str] = None
    flaws: Optional[str] = None
    
    # Habilidades e ações
    special_abilities: Optional[str] = None
    actions: Optional[str] = None
    reactions: Optional[str] = None
    equipment: Optional[List[str]] = None
    
    # Informações narrativas
    description: Optional[str] = None
    backstory: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    faction: Optional[str] = None
    
    # Informações de jogo
    challenge_rating: Optional[str] = None
    experience_points: Optional[int] = None
    
    # Notas do mestre
    notes: Optional[str] = None
    quest_hooks: Optional[str] = None

class NPC(NPCBase):
    id: str
    creator_id: str
    
    class Config:
        from_attributes = True

# --- Schemas de Story ---
class StoryBase(BaseModel):
    title: str
    synopsis: Optional[str] = None

class StoryCreate(StoryBase):
    item_ids: List[str] = []
    monster_ids: List[str] = []
    npc_ids: List[str] = []

class StoryUpdate(BaseModel):
    title: Optional[str] = None
    synopsis: Optional[str] = None
    item_ids: Optional[List[str]] = None
    monster_ids: Optional[List[str]] = None
    npc_ids: Optional[List[str]] = None

class Story(StoryBase):
    id: str
    creator_id: str
    items: List[Item] = []
    monsters: List[Monster] = []
    npcs: List[NPC] = []
    
    class Config:
        from_attributes = True

# --- Modelos de Usuário ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

# NOVO Schema para atualização de perfil
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    bio: Optional[str] = None

# NOVO Schema para atualização de notificações
class NotificationSettingsUpdate(BaseModel):
    notify_on_join_request: Optional[bool] = None
    notify_on_request_approved: Optional[bool] = None
    notify_on_new_story: Optional[bool] = None

class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Schema para exibir uma solicitação ---
class JoinRequestBase(BaseModel):
    message: Optional[str] = None

class JoinRequestCreate(JoinRequestBase):
    table_id: str
    character_id: str

class JoinRequest(JoinRequestBase):
    id: str
    table_id: str
    user_id: str
    character_id: str
    status: str = "pending"
    master_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: UserBase  # Dados básicos de quem pediu para entrar
    character: 'Character'  # Personagem escolhido
    
    class Config:
        from_attributes = True

# --- Atualize o User Schema para incluir as relações ---
class User(UserBase):
    id: str
    is_active: bool
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    notify_on_join_request: bool
    notify_on_request_approved: bool
    notify_on_new_story: bool
    tables: List[Table] = []
    characters: List[Character] = []
    items: List[Item] = []
    monsters: List[Monster] = []
    npcs: List[NPC] = []
    stories: List[Story] = []
    joined_tables: List[Table] = []  # Mesas que o usuário entrou como jogador
    
    class Config:
        from_attributes = True

# --- Modelos de Token ---
class TokenRequestForm(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenWithRefresh(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None

# --- Schema para Backup Completo do Usuário ---
class UserBackup(BaseModel):
    characters: List[Character]
    items: List[Item]
    monsters: List[Monster]
    npcs: List[NPC]
    stories: List[Story]

# --- Schema para Inventário Completo do Usuário ---
class UserInventory(BaseModel):
    characters: List[Character]
    items: List[Item]
    monsters: List[Monster]
    npcs: List[NPC]
    stories: List[Story]
    
    class Config:
        from_attributes = True