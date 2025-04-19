from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import models
from app.database import SessionLocal
from app.schemas.user_schema import UserCreate, UserOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        email=user.email,
        password=user.password  # TO DO hash
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
