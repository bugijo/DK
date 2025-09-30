# src/routers/monsters.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database

router = APIRouter(
    prefix="/api/v1/monsters",
    tags=["monsters"],
    dependencies=[Depends(auth.get_current_user_from_token)]
)

@router.post("/", response_model=schemas.Monster)
def create_monster(
    monster: schemas.MonsterCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    return crud.create_monster_for_user(db=db, monster=monster, user_id=current_user.user_id)

@router.get("/", response_model=List[schemas.Monster])
def read_user_monsters(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    return crud.get_user_monsters(db=db, user_id=current_user.user_id, skip=skip, limit=limit)

@router.get("/{monster_id}", response_model=schemas.Monster)
def read_monster(
    monster_id: str,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    db_monster = crud.get_monster_by_id(db, monster_id=monster_id, user_id=current_user.user_id)
    if db_monster is None:
        raise HTTPException(status_code=404, detail="Monster not found")
    return db_monster

@router.put("/{monster_id}", response_model=schemas.Monster)
def update_monster(
    monster_id: str,
    monster_update: schemas.MonsterUpdate,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    db_monster = crud.update_user_monster(db, monster_id=monster_id, monster_update=monster_update, user_id=current_user.user_id)
    if db_monster is None:
        raise HTTPException(status_code=404, detail="Monster not found")
    return db_monster

@router.delete("/{monster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monster(
    monster_id: str,
    db: Session = Depends(database.get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    success = crud.delete_user_monster(db, monster_id=monster_id, user_id=current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Monster not found")
    return {"ok": True}