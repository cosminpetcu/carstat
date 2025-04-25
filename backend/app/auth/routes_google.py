from fastapi import APIRouter, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from app.database import SessionLocal
from app.models.models import User
from app.auth.utils import create_access_token
from dotenv import load_dotenv
import os
from urllib.parse import urlencode

router = APIRouter(prefix="/auth/google", tags=["auth"])

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/login")
async def login(request: Request):
    redirect_uri = REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def auth_callback(request: Request, db: SessionLocal = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if user_info is None:
        raise HTTPException(status_code=400, detail="Google auth failed")

    email = user_info["email"]
    name = user_info.get("name", "")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(email=email, full_name=name, password="-")
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    
    query = urlencode({
    "token": access_token,
    "user_id": user.id,
    "email": user.email,
    "full_name": user.full_name or ""
    })

    redirect = RedirectResponse(url=f"http://localhost:3000/login?{query}")
    return redirect
