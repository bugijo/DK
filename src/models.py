# src/models.py
from sqlalchemy import Table, Column, Integer, String, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# --- TABELAS DE ASSOCIAÇÃO (Muitos-para-Muitos) ---
story_item_association = Table('story_item_association', Base.metadata,
    Column('story_id', String, ForeignKey('stories.id'), primary_key=True),
    Column('item_id', String, ForeignKey('items.id'), primary_key=True)
)

story_monster_association = Table('story_monster_association', Base.metadata,
    Column('story_id', String, ForeignKey('stories.id'), primary_key=True),
    Column('monster_id', String, ForeignKey('monsters.id'), primary_key=True)
)

story_npc_association = Table('story_npc_association', Base.metadata,
    Column('story_id', String, ForeignKey('stories.id'), primary_key=True),
    Column('npc_id', String, ForeignKey('npcs.id'), primary_key=True)
)

# Tabela de associação para registrar jogadores APROVADOS em uma mesa
table_players_association = Table('table_players_association', Base.metadata,
    Column('table_id', String, ForeignKey('tables.id'), primary_key=True),
    Column('user_id', String, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    bio = Column(String, nullable=True)  # NOVO CAMPO
    avatar_url = Column(String, nullable=True)  # NOVO CAMPO
    notify_on_join_request = Column(Boolean, default=True)  # Mestre recebe e-mail quando alguém pede pra entrar
    notify_on_request_approved = Column(Boolean, default=True)  # Jogador recebe e-mail quando seu pedido é aprovado
    notify_on_new_story = Column(Boolean, default=True)  # Jogador recebe e-mail sobre novas histórias (marketing futuro)
    
    # Relacionamentos
    characters = relationship("Character", back_populates="owner")
    tables = relationship("Table", back_populates="master")
    items = relationship("Item", back_populates="creator")
    monsters = relationship("Monster", back_populates="creator")
    npcs = relationship("NPC", back_populates="creator")
    stories = relationship("Story", back_populates="creator")
    # Relação com as mesas em que o usuário é um jogador aprovado
    joined_tables = relationship("Table", secondary=table_players_association, back_populates="players")

# --- NOVO MODELO TABLE ---
class Table(Base):
    __tablename__ = "tables"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    master_id = Column(String, ForeignKey("users.id"))
    story_id = Column(String, ForeignKey("stories.id"))
    map_image_url = Column(String, nullable=True)
    tokens_state = Column(JSON, nullable=True)  # Armazenará uma lista de objetos de token
    
    # Configurações da mesa
    max_players = Column(Integer, default=6)  # Limite máximo de jogadores
    min_character_level = Column(Integer, nullable=True)  # Nível mínimo do personagem
    max_character_level = Column(Integer, nullable=True)  # Nível máximo do personagem
    scheduled_date = Column(DateTime, nullable=True)  # Data e hora agendada
    location = Column(String, nullable=True)  # Local da sessão
    campaign_description = Column(Text, nullable=True)  # Descrição detalhada da campanha
    is_active = Column(Boolean, default=True)  # Mesa ativa ou arquivada
    
    # Relacionamentos
    master = relationship("User", back_populates="tables")
    story = relationship("Story")
    # Jogadores aprovados na mesa
    players = relationship("User", secondary=table_players_association, back_populates="joined_tables")
    # Solicitações pendentes para a mesa
    join_requests = relationship("JoinRequest")

# --- NOVO MODELO CHARACTER ---
class Character(Base):
    __tablename__ = "characters"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    race = Column(String)
    character_class = Column(String)
    level = Column(Integer, default=1)
    background = Column(String, nullable=True)  # Ex: "Soldado", "Erudito", "Criminoso"
    alignment = Column(String, nullable=True)  # Ex: "Leal e Bom", "Caótico Neutro"
    
    # Atributos básicos
    strength = Column(Integer, default=10)
    dexterity = Column(Integer, default=10)
    constitution = Column(Integer, default=10)
    intelligence = Column(Integer, default=10)
    wisdom = Column(Integer, default=10)
    charisma = Column(Integer, default=10)
    
    # Pontos de vida e defesa
    hit_points = Column(Integer, default=8)
    max_hit_points = Column(Integer, default=8)
    armor_class = Column(Integer, default=10)
    
    # Informações narrativas
    backstory = Column(Text, nullable=True)
    personality_traits = Column(Text, nullable=True)
    ideals = Column(Text, nullable=True)
    bonds = Column(Text, nullable=True)
    flaws = Column(Text, nullable=True)
    
    # Equipamentos e notas
    equipment = Column(JSON, nullable=True)  # Lista de equipamentos
    notes = Column(Text, nullable=True)  # Notas do jogador
    
    owner_id = Column(String, ForeignKey("users.id"))
    
    # Relacionamento
    owner = relationship("User", back_populates="characters")

# --- NOVO MODELO ITEM ---
class Item(Base):
    __tablename__ = "items"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    type = Column(String, default="Mundane")  # Ex: 'Weapon', 'Armor', 'Potion', 'Mundane'
    rarity = Column(String, default="Common")  # Ex: 'Common', 'Uncommon', 'Rare'
    image_url = Column(String)  # URL da imagem do item
    price = Column(Integer, default=0)  # Preço do item em moedas de ouro
    creator_id = Column(String, ForeignKey("users.id"))
    
    # Relacionamento
    creator = relationship("User", back_populates="items")
    stories = relationship("Story", secondary=story_item_association, back_populates="items")

# --- NOVO MODELO MONSTER ---
class Monster(Base):
    __tablename__ = "monsters"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    size = Column(String)  # Ex: Medium, Large
    type = Column(String)  # Ex: Beast, Undead, Aberration
    armor_class = Column(Integer)
    hit_points = Column(String)  # Ex: "22 (4d8 + 4)"
    speed = Column(String)  # Ex: "30 ft."
    
    # Atributos D&D 5e
    strength = Column(Integer, default=10)
    dexterity = Column(Integer, default=10)
    constitution = Column(Integer, default=10)
    intelligence = Column(Integer, default=10)
    wisdom = Column(Integer, default=10)
    charisma = Column(Integer, default=10)
    
    # Proficiências e resistências
    saving_throws = Column(Text)  # Ex: "Dex +3, Wis +2"
    skills = Column(Text)  # Ex: "Perception +4, Stealth +5"
    damage_resistances = Column(Text)  # Ex: "Fire, Cold"
    damage_immunities = Column(Text)  # Ex: "Poison, Necrotic"
    condition_immunities = Column(Text)  # Ex: "Charmed, Frightened"
    senses = Column(Text)  # Ex: "Darkvision 60 ft., passive Perception 14"
    languages = Column(Text)  # Ex: "Common, Draconic"
    
    # Habilidades e ações
    special_abilities = Column(Text)  # Habilidades especiais/traits
    actions = Column(Text)  # Ações de combate
    legendary_actions = Column(Text)  # Ações lendárias
    reactions = Column(Text)  # Reações
    
    challenge_rating = Column(String)  # Ex: "1/2" ou "5"
    experience_points = Column(Integer, default=0)  # XP concedido
    
    # Informações adicionais
    description = Column(Text)  # Descrição e lore
    environment = Column(String)  # Habitat natural
    
    creator_id = Column(String, ForeignKey("users.id"))
    
    # Relacionamento
    creator = relationship("User", back_populates="monsters")
    stories = relationship("Story", secondary=story_monster_association, back_populates="monsters")

# --- NOVO MODELO NPC ---
class NPC(Base):
    __tablename__ = "npcs"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    
    # Informações básicas
    race = Column(String)  # Ex: Humano, Elfo, Halfling
    character_class = Column(String)  # Ex: Guerreiro, Ladino, Comerciante
    level = Column(Integer, default=1)
    size = Column(String, default="Medium")  # Ex: Small, Medium, Large
    alignment = Column(String)  # Ex: "Leal e Bom", "Caótico Neutro"
    armor_class = Column(Integer, default=10)
    hit_points = Column(String, default="4 (1d8)")  # Ex: "22 (4d8 + 4)"
    speed = Column(String, default="30 ft.")  # Ex: "30 ft., fly 60 ft."
    
    # Atributos D&D 5e
    strength = Column(Integer, default=10)
    dexterity = Column(Integer, default=10)
    constitution = Column(Integer, default=10)
    intelligence = Column(Integer, default=10)
    wisdom = Column(Integer, default=10)
    charisma = Column(Integer, default=10)
    
    # Proficiências e habilidades
    saving_throws = Column(Text)  # Ex: "Dex +3, Wis +2"
    skills = Column(Text)  # Ex: "Perception +4, Persuasion +5"
    damage_resistances = Column(Text)  # Ex: "Fire, Cold"
    damage_immunities = Column(Text)  # Ex: "Poison, Necrotic"
    condition_immunities = Column(Text)  # Ex: "Charmed, Frightened"
    senses = Column(Text)  # Ex: "Darkvision 60 ft., passive Perception 14"
    languages = Column(Text)  # Ex: "Common, Elvish"
    
    # Personalidade e interpretação
    personality_traits = Column(Text)  # Traços de personalidade
    ideals = Column(Text)  # Ideais e motivações
    bonds = Column(Text)  # Vínculos importantes
    flaws = Column(Text)  # Defeitos e fraquezas
    
    # Habilidades e ações
    special_abilities = Column(Text)  # Habilidades especiais/traits
    actions = Column(Text)  # Ações de combate
    reactions = Column(Text)  # Reações
    equipment = Column(JSON)  # Equipamentos e itens
    
    # Informações narrativas
    description = Column(Text)  # Descrição física detalhada
    backstory = Column(Text)  # História pessoal
    role = Column(String)  # Ex: Lojista, Guarda, Nobre, Vilão
    location = Column(String)  # Ex: "Taverna do Pônei Saltitante"
    faction = Column(String)  # Facção ou organização
    
    # Informações de jogo
    challenge_rating = Column(String, default="0")  # Ex: "1/2" ou "5"
    experience_points = Column(Integer, default=0)  # XP se derrotado
    
    # Notas do mestre
    notes = Column(Text)  # Notas secretas para o mestre
    quest_hooks = Column(Text)  # Ganchos de missão relacionados
    
    creator_id = Column(String, ForeignKey("users.id"))
    
    # Relacionamento
    creator = relationship("User", back_populates="npcs")
    stories = relationship("Story", secondary=story_npc_association, back_populates="npcs")

# --- NOVO MODELO STORY ---
class Story(Base):
    __tablename__ = "stories"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    synopsis = Column(Text)
    creator_id = Column(String, ForeignKey("users.id"))
    
    # Relacionamentos
    creator = relationship("User", back_populates="stories")
    items = relationship("Item", secondary=story_item_association, back_populates="stories")
    monsters = relationship("Monster", secondary=story_monster_association, back_populates="stories")
    npcs = relationship("NPC", secondary=story_npc_association, back_populates="stories")

# --- NOVO MODELO JOIN REQUEST ---
# Tabela para registrar solicitações PENDENTES
class JoinRequest(Base):
    __tablename__ = "join_requests"
    
    id = Column(String, primary_key=True, index=True)
    table_id = Column(String, ForeignKey("tables.id"))
    user_id = Column(String, ForeignKey("users.id"))
    character_id = Column(String, ForeignKey("characters.id"))  # Personagem escolhido
    status = Column(String, default="pending")  # pending, approved, declined
    message = Column(Text, nullable=True)  # Mensagem do jogador para o mestre
    master_response = Column(Text, nullable=True)  # Resposta/feedback do mestre
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")
    character = relationship("Character")
    table = relationship("Table")

# --- MODELO PARA TOKENS REVOGADOS ---
class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    
    id = Column(String, primary_key=True, index=True)
    jti = Column(String, unique=True, index=True)  # JWT ID
    user_id = Column(String, ForeignKey("users.id"))
    token_type = Column(String)  # 'access' ou 'refresh'
    revoked_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # Quando o token expira naturalmente
    reason = Column(String, nullable=True)  # Motivo da revogação: 'logout', 'password_change', 'refresh_rotation'
    
    # Relacionamento
    user = relationship("User")