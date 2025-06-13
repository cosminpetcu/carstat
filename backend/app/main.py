from fastapi import FastAPI
from app.database import Base, engine
from app.routers import car_listing_router
from app.routers import favorite_router
from app.auth.routes import router as auth_router
from app.auth.routes_google import router as google_auth_router
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from app.routers import saved_search_router
from app.routers import analytics_router
from app.routers import estimation_history_router
from app.routers import estimation_router
import os

load_dotenv()

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "fallback-secret"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(car_listing_router.router)
app.include_router(favorite_router.router)
app.include_router(saved_search_router.router)
app.include_router(auth_router)
app.include_router(google_auth_router)
app.include_router(analytics_router.router)
app.include_router(estimation_router.router)
app.include_router(estimation_history_router.router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}
