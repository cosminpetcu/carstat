from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User
from app.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.auth.utils import (
    verify_password,
    hash_password,
    create_access_token
)

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login", response_model=TokenResponse)
def login_user(login: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    try:
        if not verify_password(login.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token}

@router.post("/register", response_model=TokenResponse)
def register_user(register: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == register.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_pw = hash_password(register.password)

    new_user = User(email=register.email, password=hashed_pw, full_name=register.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": access_token}
