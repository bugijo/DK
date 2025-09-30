from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/api/v1/characters",
    tags=["characters"],
    dependencies=[Depends(auth.get_current_user_from_token)]
)

@router.post("/", response_model=schemas.Character)
def create_character(
    character: schemas.CharacterCreate,
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Cria um novo personagem para o usuário atual."""
    return crud.create_character_for_user(db=db, character=character, owner_id=current_user.user_id)

@router.get("/", response_model=List[schemas.Character])
def read_user_characters(
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Lista todos os personagens do usuário atual."""
    return crud.get_characters_by_owner(db=db, owner_id=current_user.user_id)

@router.get("/{character_id}", response_model=schemas.Character)
def read_character(
    character_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Busca um personagem específico do usuário."""
    db_character = crud.get_character_by_id(db, character_id=character_id, owner_id=current_user.user_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character

@router.put("/{character_id}", response_model=schemas.Character)
def update_character(
    character_id: str,
    character_update: schemas.CharacterUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Atualiza um personagem específico do usuário."""
    db_character = crud.update_user_character(db, character_id=character_id, character_update=character_update, owner_id=current_user.user_id)
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character

@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character(
    character_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    """Deleta um personagem específico do usuário."""
    success = crud.delete_user_character(db, character_id=character_id, owner_id=current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"ok": True}  # O corpo não será enviado devido ao status 204