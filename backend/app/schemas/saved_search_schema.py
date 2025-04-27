from pydantic import BaseModel

class SavedSearchCreate(BaseModel):
    user_id: int
    query: str

class SavedSearchOut(BaseModel):
    id: int
    user_id: int
    query: str

    class Config:
        from_attributes = True
