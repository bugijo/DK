from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database

router = APIRouter(
    prefix="/api/v1/npcs",
    tags=["npcs"],
    dependencies=[Depends(auth.get_current_user_from_token)]
)

@router.post("/", response_model=schemas.NPC)
def create_npc(
    npc: schemas.NPCCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    return crud.create_npc_for_user(db=db, npc=npc, user_id=current_user.user_id)

@router.get("/", response_model=List[schemas.NPC])
def read_user_npcs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    return crud.get_user_npcs(db=db, user_id=current_user.user_id, skip=skip, limit=limit)