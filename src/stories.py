# src/stories.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas
from .database import get_db
from .auth import get_current_user_from_token

router = APIRouter(
    prefix="/stories",
    tags=["stories"]
)

@router.post("/", response_model=schemas.Story)
def create_story(story: schemas.StoryCreate, db: Session = Depends(get_db), current_user: schemas.TokenData = Depends(get_current_user_from_token)):
    return crud.create_story_for_user(db=db, story_data=story, user_id=current_user.user_id)

@router.get("/", response_model=List[schemas.Story])
def read_user_stories(db: Session = Depends(get_db), current_user: schemas.TokenData = Depends(get_current_user_from_token)):
    return crud.get_user_stories(db=db, user_id=current_user.user_id)