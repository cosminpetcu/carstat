from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.models import SavedSearch
from app.schemas.saved_search_schema import SavedSearchCreate, SavedSearchOut
from app.crud import saved_search_crud
from typing import List
from fastapi import Query

router = APIRouter(
    prefix="/saved-searches",
    tags=["Saved Searches"],
)

@router.post("/", response_model=SavedSearchOut)
def create_search(search: SavedSearchCreate, db: Session = Depends(get_db)):
    return saved_search_crud.create_saved_search(db, search)

@router.get("/", response_model=List[SavedSearchOut])
def get_saved_searches(user_id: int = Query(...), db: Session = Depends(get_db)):
    searches = db.query(SavedSearch).filter(SavedSearch.user_id == user_id).all()
    return searches

@router.delete("/{search_id}")
def delete_saved_search(search_id: int, db: Session = Depends(get_db)):
    search = db.query(SavedSearch).filter(SavedSearch.id == search_id).first()
    if not search:
        raise HTTPException(status_code=404, detail="Saved search not found")
    db.delete(search)
    db.commit()
    return {"detail": "Saved search deleted"}
