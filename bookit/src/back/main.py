from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from pydantic import BaseModel
from typing import Optional
from jose import jwt, JWTError
import bcrypt
from datetime import datetime, timedelta

SECRET_KEY = "asdasdjj"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

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

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    booking_history = Column(String, default="")
    total_hours_booked = Column(Float, default=0.0)
    favorite_listings = Column(String, default="")
    rating = Column(Float, default=0.0)

class Listing(Base):
    __tablename__ = "listings"
    id              = Column(Integer, primary_key=True)
    title           = Column(String)
    city            = Column(String)
    category        = Column(String)
    price_per_night = Column(Float)
    max_guests      = Column(Integer)
    description     = Column(String, default="")
    image_url       = Column(String, default="")
    amenities       = Column(String, default="")

Base.metadata.create_all(engine)

# --- Схемы ---
class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    booking_history: str = ""
    total_hours_booked: float = 0.0
    favorite_listings: str = ""
    rating: float = 0.0
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

class ListingCreate(BaseModel):
    title: str
    city: str
    category: str
    price_per_night: float
    max_guests: int
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    amenities: Optional[str] = ""

class ListingOut(ListingCreate):
    id: int
    model_config = {"from_attributes": True}
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
# --- Хелперы ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- Auth ---
@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=data.full_name,
        email=data.email,
        password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Listings ---
@app.get("/listings/", response_model=list[ListingOut])
def get_listings(city: str = None, category: str = None, db: Session = Depends(get_db)):
    q = db.query(Listing)
    if city:
        q = q.filter(Listing.city.ilike(f"%{city}%"))
    if category:
        q = q.filter(Listing.category == category)
    return q.all()

@app.get("/listings/three", response_model=list[ListingOut])
def get_three_listings(db: Session = Depends(get_db)):
    return db.query(Listing).limit(3).all()

@app.post("/listings/", response_model=ListingOut, status_code=201)
def create_listing(data: ListingCreate, db: Session = Depends(get_db)):
    listing = Listing(**data.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@app.get("/listings/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    return listing

@app.put("/listings/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: int, data: ListingCreate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in data.model_dump().items():
        setattr(listing, key, val)
    db.commit()
    db.refresh(listing)
    return listing

@app.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    db.query(Listing).filter(Listing.id == listing_id).delete()
    db.commit()

@app.get("/users/rating", response_model=list[UserOut])
def get_users_stat(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.rating.desc()).all()

# эндпоинт для добавления/удаления из избранного
@app.post("/users/favorites/{listing_id}")
def toggle_favorite(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorites = set(current_user.favorite_listings.split(',')) if current_user.favorite_listings else set()
    favorites.discard('')  # убираем пустые строки
    
    if str(listing_id) in favorites:
        favorites.remove(str(listing_id))  # убираем если уже есть
        added = False
    else:
        favorites.add(str(listing_id))  # добавляем если нет
        added = True
    
    current_user.favorite_listings = ','.join(favorites)
    db.commit()
    return {"added": added, "favorites": current_user.favorite_listings}
    
@app.put("/users/me", response_model=UserOut)
def update_user_info(data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.full_name:
        current_user.full_name = data.full_name
    if data.email:
        existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = data.email
    db.commit()
    db.refresh(current_user)
    return current_user