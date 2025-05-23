from sqlalchemy.orm import Session
from app.models.models import EstimationHistory
from app.schemas.estimation_history_schema import EstimationHistoryCreate, EstimationHistoryUpdate
from typing import List, Optional
from datetime import datetime

def create_estimation_history(db: Session, estimation_data: EstimationHistoryCreate):
    db_estimation = EstimationHistory(**estimation_data.dict())
    db.add(db_estimation)
    db.commit()
    db.refresh(db_estimation)
    return db_estimation

def get_estimation_history_by_user(db: Session, user_id: int, limit: int = 50, skip: int = 0) -> List[EstimationHistory]:
    return db.query(EstimationHistory).filter(
        EstimationHistory.user_id == user_id
    ).order_by(EstimationHistory.created_at.desc()).offset(skip).limit(limit).all()

def get_estimation_by_id(db: Session, estimation_id: int, user_id: int) -> Optional[EstimationHistory]:
    return db.query(EstimationHistory).filter(
        EstimationHistory.id == estimation_id,
        EstimationHistory.user_id == user_id
    ).first()

def update_estimation_notes(db: Session, estimation_id: int, user_id: int, update_data: EstimationHistoryUpdate):
    estimation = db.query(EstimationHistory).filter(
        EstimationHistory.id == estimation_id,
        EstimationHistory.user_id == user_id
    ).first()
    
    if estimation:
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(estimation, field, value)
        db.commit()
        db.refresh(estimation)
    
    return estimation

def delete_estimation_history(db: Session, estimation_id: int, user_id: int) -> bool:
    estimation = db.query(EstimationHistory).filter(
        EstimationHistory.id == estimation_id,
        EstimationHistory.user_id == user_id
    ).first()
    
    if estimation:
        db.delete(estimation)
        db.commit()
        return True
    return False

def get_estimation_stats_by_user(db: Session, user_id: int):
    total_estimations = db.query(EstimationHistory).filter(
        EstimationHistory.user_id == user_id
    ).count()
    
    return {
        "total_estimations": total_estimations,
        "recent_estimations_count": db.query(EstimationHistory).filter(
            EstimationHistory.user_id == user_id,
            EstimationHistory.created_at >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        ).count()
    }