from fastapi import FastAPI
from app.database import Base, engine
from app.models import models
from app.routers import car_listing_router
from app.routers import favorite_router
from app.routers import user_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(car_listing_router.router)
app.include_router(favorite_router.router)
app.include_router(user_router.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}
