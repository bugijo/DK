from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/api/v1/items",
    tags=["items"],
    dependencies=[Depends(auth.get_current_user_from_token)]
)

@router.post("/", response_model=schemas.Item)
def create_item(
    item: schemas.ItemCreate,
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token),
    db: Session = Depends(get_db)
):
    return crud.create_user_item(db=db, item=item, user_id=current_user.user_id)

@router.get("/", response_model=List[schemas.Item])
def read_user_items(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token),
    db: Session = Depends(get_db)
):
    return crud.get_user_items(db=db, user_id=current_user.user_id, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=schemas.Item)
def read_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    db_item = crud.get_item_by_id(db, item_id=item_id, user_id=current_user.user_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.put("/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: str,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    db_item = crud.update_user_item(db, item_id=item_id, item_update=item_update, user_id=current_user.user_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)
):
    success = crud.delete_user_item(db, item_id=item_id, user_id=current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}  # O corpo não será enviado devido ao status 204