from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class EstimationHistoryCreate(BaseModel):
    user_id: int
    car_data: Dict[str, Any]
    estimation_result: Dict[str, Any]
    notes: Optional[str] = None

class EstimationHistoryOut(BaseModel):
    id: int
    user_id: int
    car_data: Dict[str, Any]
    estimation_result: Dict[str, Any]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class EstimationHistoryUpdate(BaseModel):
    notes: Optional[str] = None