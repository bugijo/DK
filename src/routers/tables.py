from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil
from pathlib import Path

from .. import crud, models, schemas, auth
from ..database import get_db
from .game_ws import notify_map_updated

router = APIRouter(
    prefix="/api/v1/tables",
    tags=["tables"]
)

# --- Endpoints Existentes de Mesas ---
@router.get("/", response_model=List[schemas.Table])
def get_all_tables(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    from ..cache import get_active_tables, cache_active_tables
    
    # Tenta obter do cache primeiro (apenas para skip=0 e limit padrão)
    if skip == 0 and limit == 100:
        cached_tables = get_active_tables()
        if cached_tables is not None:
            return cached_tables
    
    # Se não estiver no cache, busca no banco
    tables = crud.get_tables(db, skip=skip, limit=limit)
    
    # Cacheia o resultado (apenas para consulta padrão)
    if skip == 0 and limit == 100:
        # Converte para dict para serialização
        tables_dict = [table.__dict__ for table in tables]
        cache_active_tables(tables_dict, expire_minutes=5)
    
    return tables

@router.post("/", response_model=schemas.Table)
def create_new_table(
    table_data: schemas.TableCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    from ..cache import cache
    
    # Cria a mesa
    new_table = crud.create_table(db=db, table=table_data, master_id=current_user.user_id)
    
    # Invalida cache de mesas ativas
    cache.delete("tables:active")
    
    return new_table

# --- Novos Endpoints para Gerenciamento de Jogadores ---
@router.post("/{table_id}/join", response_model=schemas.JoinRequest)
def request_to_join_table(
    table_id: str,
    request_data: schemas.JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Solicita entrada em uma mesa com personagem específico"""
    # Verifica se a mesa existe
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    
    # Verifica se o usuário não é o mestre da mesa
    if table.master_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="O mestre não pode solicitar entrada na própria mesa")
    
    # Verifica se o personagem existe e pertence ao usuário
    character = db.query(models.Character).filter(
        models.Character.id == request_data.character_id,
        models.Character.owner_id == current_user.user_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Personagem não encontrado ou não pertence ao usuário")
    
    # Valida requisitos de nível da mesa
    if table.min_character_level and character.level < table.min_character_level:
        raise HTTPException(
            status_code=400, 
            detail=f"Personagem deve ter nível mínimo {table.min_character_level}. Seu personagem tem nível {character.level}"
        )
    
    if table.max_character_level and character.level > table.max_character_level:
        raise HTTPException(
            status_code=400, 
            detail=f"Personagem deve ter nível máximo {table.max_character_level}. Seu personagem tem nível {character.level}"
        )
    
    # Verifica se a mesa não está lotada
    current_players = len(table.players)
    if current_players >= table.max_players:
        raise HTTPException(
            status_code=400, 
            detail=f"Mesa lotada. Máximo de {table.max_players} jogadores"
        )
    
    join_request = crud.create_join_request(
        db=db, 
        table_id=table_id, 
        user_id=current_user.user_id,
        character_id=request_data.character_id,
        message=request_data.message
    )
    if not join_request:
        raise HTTPException(
            status_code=400, 
            detail="Já existe uma solicitação pendente ou você já é jogador desta mesa"
        )
    
    return join_request

@router.post("/requests/{request_id}/approve", response_model=schemas.JoinRequest)
def approve_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Aprova uma solicitação de entrada (apenas o mestre da mesa pode fazer isso)"""
    # Busca a solicitação
    join_request = db.query(models.JoinRequest).filter(models.JoinRequest.id == request_id).first()
    if not join_request:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    
    # Verifica se o usuário atual é o mestre da mesa
    table = db.query(models.Table).filter(models.Table.id == join_request.table_id).first()
    if not table or table.master_id != current_user.user_id:
        raise HTTPException(
            status_code=403, 
            detail="Apenas o mestre da mesa pode aprovar solicitações"
        )
    
    # Aprova a solicitação
    updated_request = crud.manage_join_request(db=db, request_id=request_id, new_status="approved")
    return updated_request

@router.post("/requests/{request_id}/decline", response_model=schemas.JoinRequest)
def decline_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Recusa uma solicitação de entrada (apenas o mestre da mesa pode fazer isso)"""
    # Busca a solicitação
    join_request = db.query(models.JoinRequest).filter(models.JoinRequest.id == request_id).first()
    if not join_request:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    
    # Verifica se o usuário atual é o mestre da mesa
    table = db.query(models.Table).filter(models.Table.id == join_request.table_id).first()
    if not table or table.master_id != current_user.user_id:
        raise HTTPException(
            status_code=403, 
            detail="Apenas o mestre da mesa pode recusar solicitações"
        )
    
    # Recusa a solicitação
    updated_request = crud.manage_join_request(db=db, request_id=request_id, new_status="declined")
    return updated_request

# Endpoint genérico para solicitações (usado pelo teste)
@router.post("/join-requests", response_model=schemas.JoinRequest)
def create_join_request(
    request_data: schemas.JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Cria uma solicitação de entrada em uma mesa"""
    # Verifica se a mesa existe
    table = db.query(models.Table).filter(models.Table.id == request_data.table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    
    # Verifica se o usuário não é o mestre da mesa
    if table.master_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="O mestre não pode solicitar entrada na própria mesa")
    
    # Verifica se o personagem existe e pertence ao usuário
    character = db.query(models.Character).filter(
        models.Character.id == request_data.character_id,
        models.Character.owner_id == current_user.user_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Personagem não encontrado ou não pertence ao usuário")
    
    # Valida requisitos de nível da mesa
    if table.min_character_level and character.level < table.min_character_level:
        raise HTTPException(
            status_code=400, 
            detail=f"Personagem deve ter nível mínimo {table.min_character_level}. Seu personagem tem nível {character.level}"
        )
    
    if table.max_character_level and character.level > table.max_character_level:
        raise HTTPException(
            status_code=400, 
            detail=f"Personagem deve ter nível máximo {table.max_character_level}. Seu personagem tem nível {character.level}"
        )
    
    # Verifica se a mesa não está lotada
    current_players = len(table.players)
    if current_players >= table.max_players:
        raise HTTPException(
            status_code=400, 
            detail=f"Mesa lotada. Máximo de {table.max_players} jogadores"
        )
    
    join_request = crud.create_join_request(
        db=db, 
        table_id=request_data.table_id, 
        user_id=current_user.user_id,
        character_id=request_data.character_id,
        message=request_data.message
    )
    if not join_request:
        raise HTTPException(
            status_code=400, 
            detail="Já existe uma solicitação pendente ou você já é jogador desta mesa"
        )
    
    return join_request

@router.get("/{table_id}/requests", response_model=List[schemas.JoinRequest])
def get_table_join_requests(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Lista as solicitações pendentes de uma mesa (apenas o mestre pode ver)"""
    # Verifica se a mesa existe e se o usuário é o mestre
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    
    if table.master_id != current_user.user_id:
        raise HTTPException(
            status_code=403, 
            detail="Apenas o mestre da mesa pode ver as solicitações"
        )
    
    return crud.get_table_join_requests(db=db, table_id=table_id)

@router.get("/{table_id}", response_model=schemas.Table)
def get_table_by_id(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Busca uma mesa específica por ID (com cache)"""
    from ..cache import get_table_details, cache_table_details
    
    # Tenta obter do cache primeiro
    cached_table = get_table_details(table_id)
    if cached_table is not None:
        return cached_table
    
    # Se não estiver no cache, busca no banco
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    
    # Cacheia o resultado
    table_dict = table.__dict__.copy()
    # Remove atributos SQLAlchemy internos
    table_dict.pop('_sa_instance_state', None)
    cache_table_details(table_id, table_dict, expire_minutes=15)
    
    return table

@router.post("/{table_id}/upload-map")
async def upload_map(
    table_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Upload de mapa para uma mesa (apenas o mestre pode fazer)"""
    # Verifica se a mesa existe e se o usuário é o mestre
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    
    if table.master_id != current_user.user_id:
        raise HTTPException(
            status_code=403, 
            detail="Apenas o mestre da mesa pode fazer upload de mapas"
        )
    
    # Verifica se é um arquivo de imagem
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400, 
            detail="Apenas arquivos de imagem são permitidos"
        )
    
    # Cria o diretório de mapas se não existir
    maps_dir = Path("static/maps")
    maps_dir.mkdir(parents=True, exist_ok=True)
    
    # Gera um nome único para o arquivo
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = maps_dir / unique_filename
    
    try:
        # Salva o arquivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Atualiza a URL do mapa na mesa
        map_url = f"/static/maps/{unique_filename}"
        table.map_image_url = map_url
        db.commit()
        db.refresh(table)
        
        # Notifica todos os jogadores conectados sobre a mudança do mapa
        try:
            await notify_map_updated(table_id)
        except Exception as ws_error:
            # Se falhar a notificação WebSocket, apenas loga mas não falha o upload
            print(f"Erro ao notificar mudança de mapa via WebSocket: {ws_error}")
        
        return {
            "message": "Mapa enviado com sucesso",
            "map_url": map_url,
            "table_id": table_id
        }
        
    except Exception as e:
        # Remove o arquivo se houve erro na atualização do banco
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao salvar o mapa: {str(e)}"
        )