"""Add performance indexes

Revision ID: df61f00706dc
Revises: ef1bb2e5d535
Create Date: 2025-09-02 14:32:32.325929

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df61f00706dc'
down_revision: Union[str, None] = 'ef1bb2e5d535'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Índices para tabela users
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    
    # Índices para tabela characters
    op.create_index('idx_characters_owner_id', 'characters', ['owner_id'])
    op.create_index('idx_characters_level', 'characters', ['level'])
    op.create_index('idx_characters_race', 'characters', ['race'])
    op.create_index('idx_characters_character_class', 'characters', ['character_class'])
    
    # Índices para tabela tables
    op.create_index('idx_tables_master_id', 'tables', ['master_id'])
    op.create_index('idx_tables_story_id', 'tables', ['story_id'])
    op.create_index('idx_tables_is_active', 'tables', ['is_active'])
    op.create_index('idx_tables_max_players', 'tables', ['max_players'])
    op.create_index('idx_tables_scheduled_date', 'tables', ['scheduled_date'])
    
    # Índices para tabela join_requests
    op.create_index('idx_join_requests_table_id', 'join_requests', ['table_id'])
    op.create_index('idx_join_requests_user_id', 'join_requests', ['user_id'])
    op.create_index('idx_join_requests_character_id', 'join_requests', ['character_id'])
    op.create_index('idx_join_requests_status', 'join_requests', ['status'])
    op.create_index('idx_join_requests_created_at', 'join_requests', ['created_at'])
    
    # Índices para tabela revoked_tokens
    op.create_index('idx_revoked_tokens_jti', 'revoked_tokens', ['jti'])
    op.create_index('idx_revoked_tokens_user_id', 'revoked_tokens', ['user_id'])
    op.create_index('idx_revoked_tokens_token_type', 'revoked_tokens', ['token_type'])
    op.create_index('idx_revoked_tokens_expires_at', 'revoked_tokens', ['expires_at'])
    
    # Índices para tabela items
    op.create_index('idx_items_creator_id', 'items', ['creator_id'])
    op.create_index('idx_items_type', 'items', ['type'])
    op.create_index('idx_items_rarity', 'items', ['rarity'])
    
    # Índices para tabela monsters
    op.create_index('idx_monsters_creator_id', 'monsters', ['creator_id'])
    op.create_index('idx_monsters_challenge_rating', 'monsters', ['challenge_rating'])
    op.create_index('idx_monsters_type', 'monsters', ['type'])
    
    # Índices para tabela npcs
    op.create_index('idx_npcs_creator_id', 'npcs', ['creator_id'])
    op.create_index('idx_npcs_race', 'npcs', ['race'])
    op.create_index('idx_npcs_character_class', 'npcs', ['character_class'])
    
    # Índices para tabela stories
    op.create_index('idx_stories_creator_id', 'stories', ['creator_id'])
    
    # Índices compostos para consultas frequentes
    op.create_index('idx_characters_owner_level', 'characters', ['owner_id', 'level'])
    op.create_index('idx_tables_active_master', 'tables', ['is_active', 'master_id'])
    op.create_index('idx_join_requests_table_status', 'join_requests', ['table_id', 'status'])
    op.create_index('idx_revoked_tokens_user_type', 'revoked_tokens', ['user_id', 'token_type'])


def downgrade() -> None:
    """Downgrade schema."""
    # Remove índices compostos
    op.drop_index('idx_revoked_tokens_user_type', 'revoked_tokens')
    op.drop_index('idx_join_requests_table_status', 'join_requests')
    op.drop_index('idx_tables_active_master', 'tables')
    op.drop_index('idx_characters_owner_level', 'characters')
    
    # Remove índices da tabela stories
    op.drop_index('idx_stories_creator_id', 'stories')
    
    # Remove índices da tabela npcs
    op.drop_index('idx_npcs_character_class', 'npcs')
    op.drop_index('idx_npcs_race', 'npcs')
    op.drop_index('idx_npcs_creator_id', 'npcs')
    
    # Remove índices da tabela monsters
    op.drop_index('idx_monsters_type', 'monsters')
    op.drop_index('idx_monsters_challenge_rating', 'monsters')
    op.drop_index('idx_monsters_creator_id', 'monsters')
    
    # Remove índices da tabela items
    op.drop_index('idx_items_rarity', 'items')
    op.drop_index('idx_items_type', 'items')
    op.drop_index('idx_items_creator_id', 'items')
    
    # Remove índices da tabela revoked_tokens
    op.drop_index('idx_revoked_tokens_expires_at', 'revoked_tokens')
    op.drop_index('idx_revoked_tokens_token_type', 'revoked_tokens')
    op.drop_index('idx_revoked_tokens_user_id', 'revoked_tokens')
    op.drop_index('idx_revoked_tokens_jti', 'revoked_tokens')
    
    # Remove índices da tabela join_requests
    op.drop_index('idx_join_requests_created_at', 'join_requests')
    op.drop_index('idx_join_requests_status', 'join_requests')
    op.drop_index('idx_join_requests_character_id', 'join_requests')
    op.drop_index('idx_join_requests_user_id', 'join_requests')
    op.drop_index('idx_join_requests_table_id', 'join_requests')
    
    # Remove índices da tabela tables
    op.drop_index('idx_tables_scheduled_date', 'tables')
    op.drop_index('idx_tables_max_players', 'tables')
    op.drop_index('idx_tables_is_active', 'tables')
    op.drop_index('idx_tables_story_id', 'tables')
    op.drop_index('idx_tables_master_id', 'tables')
    
    # Remove índices da tabela characters
    op.drop_index('idx_characters_character_class', 'characters')
    op.drop_index('idx_characters_race', 'characters')
    op.drop_index('idx_characters_level', 'characters')
    op.drop_index('idx_characters_owner_id', 'characters')
    
    # Remove índices da tabela users
    op.drop_index('idx_users_is_active', 'users')
    op.drop_index('idx_users_email', 'users')
    op.drop_index('idx_users_username', 'users')
