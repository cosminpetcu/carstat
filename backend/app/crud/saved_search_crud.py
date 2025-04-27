from sqlalchemy.orm import Session
from app.models.models import SavedSearch
from app.schemas.saved_search_schema import SavedSearchCreate

def create_saved_search(db: Session, search: SavedSearchCreate):
    db_search = SavedSearch(**search.dict())
    db.add(db_search)
    db.commit()
    db.refresh(db_search)
    return db_search
