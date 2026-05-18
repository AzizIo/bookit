# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine("sqlite:///./booking.db")
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

class Listing(Base):
    __tablename__ = "listings"
    id              = Column(Integer, primary_key=True)
    title           = Column(String)
    city            = Column(String)
    category        = Column(String)
    price_per_night = Column(Float)
    max_guests      = Column(Integer)
    description     = Column(String, default="")
    image_url       = Column(String, default="")       # ← новое
    amenities       = Column(String, default="")       # ← новое (храним как "WiFi,Coffee,Projector")

Base.metadata.create_all(engine)

class ListingCreate(BaseModel):
    title: str
    city: str
    category: str
    price_per_night: float
    max_guests: int
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    amenities: Optional[str] = ""      # строка через запятую

class ListingOut(ListingCreate):
    id: int
    class Config:
        from_attributes = True

@app.get("/listings/", response_model=list[ListingOut])
def get_listings(city: str = None, category: str = None):
    db: Session = SessionLocal()
    q = db.query(Listing)
    if city:
        q = q.filter(Listing.city.ilike(f"%{city}%"))
    if category:
        q = q.filter(Listing.category == category)
    return q.all()

@app.get("/listings/three", response_model=list[ListingOut])
def get_three_listings():
    db: Session = SessionLocal()
    return db.query(Listing).limit(3).all()

@app.post("/listings/", response_model=ListingOut, status_code=201)
def create_listing(data: ListingCreate):
    db: Session = SessionLocal()
    listing = Listing(**data.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@app.get("/listings/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int):
    db: Session = SessionLocal()
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    return listing

@app.put("/listings/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: int, data: ListingCreate):
    db: Session = SessionLocal()
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in data.model_dump().items():
        setattr(listing, key, val)
    db.commit()
    db.refresh(listing)
    return listing

@app.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int):
    db: Session = SessionLocal()
    db.query(Listing).filter(Listing.id == listing_id).delete()
    db.commit()