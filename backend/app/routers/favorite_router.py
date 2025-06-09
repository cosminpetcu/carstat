from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.favorite_schema import FavoriteCreate, FavoriteOut
from app.crud.favorite_crud import create_favorite, get_favorites_by_user, delete_favorite_by_user_and_car
from typing import List
from fastapi import HTTPException
from app.auth.utils import get_current_user
from app.models.models import User

router = APIRouter()

@router.post("/favorites", response_model=FavoriteOut)
def add_favorite(favorite_data: FavoriteCreate, db: Session = Depends(get_db)):
    return create_favorite(db, favorite_data)

@router.get("/favorites", response_model=List[FavoriteOut])
def list_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_favorites_by_user(db, current_user.id)

@router.delete("/favorites/{car_id}", response_model=FavoriteOut)
def remove_favorite(car_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorite = delete_favorite_by_user_and_car(db, current_user.id, car_id)
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return favorite