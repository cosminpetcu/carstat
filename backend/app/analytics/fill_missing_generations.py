from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing
from tqdm import tqdm

def normalize_model(model: str) -> str:
    if not model:
        return ""
    model = model.lower()
    model = model.replace("class", "")
    model = model.replace("seria", "")
    model = model.replace("series", "")
    model = model.replace("-", " ")
    model = model.strip()
    return model

def assign_missing_generations():
    db: Session = SessionLocal()
    cars_to_update = db.query(CarListing).filter(CarListing.generation == None).all()
    print(f"{len(cars_to_update)} mașini fără generație.")

    updated_count = 0

    for car in tqdm(cars_to_update, desc="Actualizare generații"):
        norm_model = normalize_model(car.model)
        possible_matches = db.query(CarListing).filter(
            CarListing.id != car.id,
            CarListing.brand == car.brand,
            CarListing.generation != None,
            CarListing.year == car.year
        ).all()

        for match in possible_matches:
            if normalize_model(match.model) == norm_model:
                car.generation = match.generation
                updated_count += 1
                break

    db.commit()
    db.close()
    print(f"Actualizate {updated_count} mașini cu generație.")

if __name__ == "__main__":
    assign_missing_generations()
