import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from app.database import SessionLocal
from app.models.models import CarListing
