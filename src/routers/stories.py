# src/routers/stories.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database

router = APIRouter(prefix="/api/v1/stories", tags=["stories"], dependencies=[Depends(auth.get_current_user_from_token)])

@router.post("/", response_model=schemas.Story)
def create_story(story: schemas.StoryCreate, db: Session = Depends(database.get_db), current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)):
    return crud.create_story_for_user(db=db, story_data=story, user_id=current_user.user_id)

@router.get("/", response_model=List[schemas.Story])
def read_user_stories(db: Session = Depends(database.get_db), current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)):
    return crud.get_user_stories(db=db, user_id=current_user.user_id)

@router.get("/{story_id}", response_model=schemas.Story)
def get_story_by_id(story_id: str, db: Session = Depends(database.get_db), current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)):
    story = crud.get_story_by_id(db=db, story_id=story_id, user_id=current_user.user_id)
    if not story:
        raise HTTPException(status_code=404, detail="História não encontrada")
    return story

@router.put("/{story_id}", response_model=schemas.Story)
def update_story(story_id: str, story_update: schemas.StoryUpdate, db: Session = Depends(database.get_db), current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)):
    story = crud.update_user_story(db=db, story_id=story_id, story_update=story_update, user_id=current_user.user_id)
    if not story:
        raise HTTPException(status_code=404, detail="História não encontrada")
    return story

@router.delete("/{story_id}")
def delete_story(story_id: str, db: Session = Depends(database.get_db), current_user: schemas.TokenData = Depends(auth.get_current_user_from_token)):
    success = crud.delete_user_story(db=db, story_id=story_id, user_id=current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="História não encontrada")
    return {"message": "História deletada com sucesso"}