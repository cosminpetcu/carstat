from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.estimation_history_schema import EstimationHistoryCreate, EstimationHistoryOut, EstimationHistoryUpdate
from app.crud import estimation_history_crud
from app.auth.utils import get_current_user
from app.models.models import User, EstimationHistory
from typing import List

router = APIRouter(prefix="/estimation-history", tags=["Estimation History"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=EstimationHistoryOut)
def save_estimation_to_history(
    estimation_data: EstimationHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if estimation_data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to save estimation for this user")
    
    return estimation_history_crud.create_estimation_history(db, estimation_data)

@router.get("/", response_model=List[EstimationHistoryOut])
def get_user_estimation_history(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return estimation_history_crud.get_estimation_history_by_user(
        db, current_user.id, limit=limit, skip=skip
    )

@router.get("/{estimation_id}", response_model=EstimationHistoryOut)
def get_estimation_by_id(
    estimation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    estimation = estimation_history_crud.get_estimation_by_id(db, estimation_id, current_user.id)
    if not estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return estimation

@router.put("/{estimation_id}", response_model=EstimationHistoryOut)
def update_estimation_notes(
    estimation_id: int,
    update_data: EstimationHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    estimation = estimation_history_crud.update_estimation_notes(
        db, estimation_id, current_user.id, update_data
    )
    if not estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return estimation

@router.delete("/{estimation_id}")
def delete_estimation_from_history(
    estimation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = estimation_history_crud.delete_estimation_history(db, estimation_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return {"detail": "Estimation deleted successfully"}

@router.get("/stats/summary")
def get_estimation_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return estimation_history_crud.get_estimation_stats_by_user(db, current_user.id)

@router.delete("/")
def clear_estimation_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted_count = db.query(EstimationHistory).filter(
        EstimationHistory.user_id == current_user.id
    ).delete()
    db.commit()
    
    return {"detail": f"Deleted {deleted_count} estimations from history"}