from sqlalchemy.orm import Session
from app.models.models import Favorite
from app.schemas.favorite_schema import FavoriteCreate
from sqlalchemy.orm import joinedload

def create_favorite(db: Session, favorite_data: FavoriteCreate):
    existing = db.query(Favorite).filter(
        Favorite.user_id == favorite_data.user_id,
        Favorite.car_id == favorite_data.car_id
    ).first()
    if existing:
        return existing

    favorite = Favorite(**favorite_data.dict())
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


def get_favorites_by_user(db: Session, user_id: int):
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()

def delete_favorite_by_user_and_car(db: Session, user_id: int, car_id: int):
    favorite = db.query(Favorite).options(joinedload(Favorite.car)).filter(
        Favorite.user_id == user_id,
        Favorite.car_id == car_id
    ).first()

    if favorite:
        db.delete(favorite)
        db.commit()
        return favorite
    return None


