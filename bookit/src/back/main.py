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
from sqlalchemy import UniqueConstraint
from sqlalchemy import ForeignKey, func
from fastapi import Body
import os
SECRET_KEY = "asdasdjj"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
ADMIN_EMAIL = "admin@bookit.com"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.getenv("DB_PATH", "./booking.db")
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    user_role = Column(String, default="renter")
    booking_history = Column(String, default="")
    total_hours_booked = Column(Float, default=0.0)
    favorite_listings = Column(String, default="")
    rating = Column(Float, default=0.0)
    last_login = Column(String, default="")

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
    owner_id        = Column(Integer, default=0)
    status          = Column(String, default="approved")
    booking_count = Column(Integer, default=0)

    average_rating  = Column(Float, default=0)
    reviews_count   = Column(Integer, default=0)

class Booking(Base):
    __tablename__ = "bookings"
    id              = Column(Integer, primary_key=True)
    listing_id           = Column(Integer)
    user_id            = Column(Integer)
    created_at        = Column(String)

class Report(Base):
    __tablename__ = 'reports'
    id = Column(Integer, primary_key=True)
    title = Column(String)
    problem = Column(String)
    email = Column(String, default="")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    user_id = Column(Integer)
    rating = Column(Integer)  # 1-5 звезд
    comment = Column(String, default="")
    __table_args__ = (
        UniqueConstraint(
            "listing_id",
            "user_id",
            name="unique_user_review"
        ),
    )

class BookingWithListing(BaseModel):
    id: int
    listing_id: int
    user_id: int
    created_at: str
    # поля листинга
    title: str = ""
    city: str = ""
    price_per_night: float = 0.0
    image_url: str = ""
    category: str = ""
    model_config = {"from_attributes": True}

Base.metadata.create_all(engine)

# миграция
import sqlite3
conn = sqlite3.connect("./booking.db")
cursor = conn.cursor()
for stmt in [
    "ALTER TABLE users ADD COLUMN user_role TEXT DEFAULT 'renter'",
    "ALTER TABLE users ADD COLUMN last_login TEXT DEFAULT ''",
    "ALTER TABLE listings ADD COLUMN owner_id INTEGER DEFAULT 0",
    "ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'approved'",
    "ALTER TABLE listings ADD COLUMN booking_count INTEGER DEFAULT 0",
    "ALTER TABLE listings ADD COLUMN average_rating FLOAT DEFAULT 0",
    "ALTER TABLE listings ADD COLUMN reviews_count INTEGER DEFAULT 0",
]:
    try:
        cursor.execute(stmt)
    except:
        pass
conn.commit()
conn.close()

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

class UserAdminOut(BaseModel):
    id: int
    full_name: str
    email: str
    user_role: str = "renter"
    booking_history: str = ""
    total_hours_booked: float = 0.0
    favorite_listings: str = ""
    rating: float = 0.0
    last_login: str = ""
    model_config = {"from_attributes": True}

class RoleUpdate(BaseModel):
    user_role: str

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
    owner_id: int = 0
    status: str = "approved"
    model_config = {"from_attributes": True}
    booking_count: int = 0  # ← добавить
    average_rating: float = 0.0
    reviews_count: int = 0

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    amenities: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

class BookingCreate(BaseModel):
    listing_id: int

class BookingOut(BaseModel):
    id: int
    listing_id: int  
    user_id: int
    created_at: str
    model_config = {"from_attributes": True}  #
class Reports(BaseModel):
    id: int
    title: str
    problem: str
    email: str
    model_config = {"from_attributes": True}
class ReportCreate(BaseModel):
    title: str
    problem: str
    email: str = ""
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

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

# --- Auth ---
@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=data.full_name,
        email=data.email,
        password=hash_password(data.password),
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
    user.last_login = str(datetime.utcnow())
    db.commit()
    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Listings (public — only approved) ---
@app.get("/listings/", response_model=list[ListingOut])
def get_listings(city: str = None, category: str = None, q: str = None, db: Session = Depends(get_db)):
    query = db.query(Listing).filter(Listing.status == "approved")
    if city:
        query = query.filter(Listing.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(Listing.category == category)
    if q:
        query = query.filter(
            (Listing.title.ilike(f"%{q}%")) | (Listing.city.ilike(f"%{q}%"))
        )
    return query.all()

@app.get("/listings/three", response_model=list[ListingOut])
def get_three_listings(db: Session = Depends(get_db)):
    return db.query(Listing).filter(Listing.status == "approved").limit(3).all()
@app.get('/listing/popular', response_model=list[ListingOut])
def get_popular(db: Session = Depends(get_db)):
    return (
        db.query(Listing)
        .filter(Listing.booking_count > 0)
        .order_by(Listing.booking_count.desc())
        .limit(5)
        .all()
    )
# пользователь отправляет объявление на модерацию (status=pending)
@app.post("/listings/", response_model=ListingOut, status_code=201)
def create_listing(data: ListingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    is_admin = current_user.email == ADMIN_EMAIL
    listing = Listing(
        **data.model_dump(),
        owner_id=current_user.id,
        status="approved" if is_admin else "pending"
    )
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

@app.get("/listings/{listing_id}/rating")
def get_listing_rating(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "listing_id": listing.id,
        "average_rating": float(listing.average_rating or 0.0),
        "reviews_count": int(listing.reviews_count or 0),
    }

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

# --- Мои объявления (все статусы) ---
@app.get("/listings/my/", response_model=list[ListingOut])
def get_my_listings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Listing).filter(Listing.owner_id == current_user.id).all()

# --- Модерация (admin only) ---
@app.get("/admin/pending", response_model=list[ListingOut])
def get_pending_listings(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(Listing).filter(Listing.status == "pending").all()

@app.put("/admin/listings/{listing_id}/approve", response_model=ListingOut)
def approve_listing(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    listing.status = "approved"
    db.commit()
    db.refresh(listing)
    return listing

@app.put("/admin/listings/{listing_id}/reject", response_model=ListingOut)
def reject_listing(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    listing.status = "rejected"
    db.commit()
    db.refresh(listing)
    return listing

@app.put("/admin/listings/{listing_id}", response_model=ListingOut)
def admin_update_listing(listing_id: int, data: ListingUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(listing, key, val)
    db.commit()
    db.refresh(listing)
    return listing

# --- Users ---
@app.get("/users/rating", response_model=list[UserOut])
def get_users_stat(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.rating.desc()).all()

@app.post("/users/favorites/{listing_id}")
def toggle_favorite(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorites = set(current_user.favorite_listings.split(',')) if current_user.favorite_listings else set()
    favorites.discard('')
    if str(listing_id) in favorites:
        favorites.remove(str(listing_id))
        added = False
    else:
        favorites.add(str(listing_id))
        added = True
    current_user.favorite_listings = ','.join(favorites)
    db.commit()
    return {"added": added, "favorites": current_user.favorite_listings}
@app.post("/reports/")
def send_report(data: ReportCreate, db: Session = Depends(get_db)):
    report = Report(
        title=data.title,
        problem=data.problem, 
        email=data.email,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
@app.get("/reports/")
def get_reports(db: Session = Depends(get_db)):
    return db.query(Report).all()
@app.delete("/reports/{report_id}", status_code=204)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    db.query(Report).filter(Report.id == report_id).delete()
    db.commit()

# --- Admin: User management ---
@app.get("/admin/users", response_model=list[UserAdminOut])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).order_by(User.id.asc()).all()

@app.put("/admin/users/{user_id}/role", response_model=UserAdminOut)
def set_user_role(user_id: int, data: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if data.user_role not in ("renter", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Use 'renter' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.email == ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Cannot change admin role")
    user.user_role = data.user_role
    db.commit()
    db.refresh(user)
    return user

@app.delete("/admin/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.email == ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Cannot delete admin")
    db.query(Booking).filter(Booking.user_id == user_id).delete()
    db.query(Review).filter(Review.user_id == user_id).delete()
    db.delete(user)
    db.commit()
@app.post("/bookings/{listing_id}")
def create_booking(listing_id: int, db: Session = Depends(get_db),  current_user: User = Depends(get_current_user)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Not found")

    
    booking = Booking(
    listing_id=listing_id,
    user_id=current_user.id,
    created_at=str(datetime.utcnow()),
    )
    listing.booking_count += 1
    history = set(current_user.booking_history.split(',')) if current_user.booking_history else set()
    history.discard('')
    
    history.add(str(listing_id))
    added = True
    current_user.booking_history = ','.join(history)
    db.add(booking)
    db.commit()
    return {"added" : added, "history": current_user.booking_history}
@app.get("/bookings/my/", response_model=list[BookingWithListing])
def get_booking(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    result = []
    for b in bookings:
        listing = db.query(Listing).filter(Listing.id == b.listing_id).first()
        result.append(BookingWithListing(
            id=b.id,
            listing_id=b.listing_id,
            user_id=b.user_id,
            created_at=b.created_at,
            title=listing.title if listing else "",
            city=listing.city if listing else "",
            price_per_night=listing.price_per_night if listing else 0.0,
            image_url=listing.image_url if listing else "",
            category=listing.category if listing else "",
        ))
    return result

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

@app.post("/reviews/{listing_id}")
def add_review(
    listing_id: int,
    rating: int = Body(...),
    comment: str = Body(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    review = db.query(Review).filter(
        Review.listing_id == listing_id,
        Review.user_id == current_user.id
    ).first()

    if review:
        raise HTTPException(status_code=400, detail="Already reviewed")

    review = Review(
        listing_id=listing_id,
        user_id=current_user.id,
        rating=rating,
        comment=comment
    )

    old_count = listing.reviews_count or 0
    listing.reviews_count = old_count + 1
    listing.average_rating = (
        (listing.average_rating or 0) * old_count + rating
    ) / listing.reviews_count

    db.add(review)
    db.commit()
    db.refresh(review)
    db.refresh(listing)
    return {
        "id": review.id,
        "listing_id": review.listing_id,
        "user_id": review.user_id,
        "rating": review.rating,
        "comment": review.comment,
    }


@app.get("/reviews/featured")
@app.get("/reviews/featured/")
def get_featured_review(db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.rating == 5).order_by(Review.id.desc()).first()
    if not review:
        review = db.query(Review).order_by(Review.id.desc()).first()
    if not review:
        return {
            "id": 0,
            "listing_id": None,
            "user_id": None,
            "rating": 5,
            "comment": "Пока нет отзывов, но скоро здесь появится лучший отзыв.",
            "user_name": "Пользователь",
            "listing_title": "",
        }
    user = db.query(User).filter(User.id == review.user_id).first()
    listing = db.query(Listing).filter(Listing.id == review.listing_id).first()
    return {
        "id": review.id,
        "listing_id": review.listing_id,
        "user_id": review.user_id,
        "rating": review.rating,
        "comment": review.comment,
        "user_name": user.full_name if user else "Пользователь",
        "listing_title": listing.title if listing else "",
    }


@app.get("/reviews/{listing_id}")
def get_reviews(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    reviews = db.query(Review).filter(Review.listing_id == listing_id).all()
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "listing_id": r.listing_id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "user_name": user.full_name if user else None,
        })
    return result
@app.get("/listings/{listing_id}/owner")
def get_listing_owner(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    owner = db.query(User).filter(User.id == listing.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Считаем сколько листингов у хозяина
    listings_count = db.query(Listing).filter(Listing.owner_id == owner.id).count()
    
    # Год регистрации из last_login или дефолт
    member_since = owner.last_login[:4] if owner.last_login else "2024"

    return {
        "id": owner.id,
        "full_name": owner.full_name,
        "rating": owner.rating,
        "listings_count": listings_count,
        
    }