from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.favorite_schema import FavoriteCreate, FavoriteOut
from app.crud.favorite_crud import create_favorite, get_favorites_by_user, delete_favorite
from typing import List
from fastapi import HTTPException

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/favorites", response_model=FavoriteOut)
def add_favorite(favorite_data: FavoriteCreate, db: Session = Depends(get_db)):
    return create_favorite(db, favorite_data)

@router.get("/favorites/{user_id}", response_model=List[FavoriteOut])
def list_favorites(user_id: int, db: Session = Depends(get_db)):
    return get_favorites_by_user(db, user_id)

@router.delete("/favorites/{favorite_id}", response_model=FavoriteOut)
def remove_favorite(favorite_id: int, db: Session = Depends(get_db)):
    favorite = delete_favorite(db, favorite_id)
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return favorite
