from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
import re
from house_search import house_search

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-this-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# User Models
class UserCreate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str
    name: str

class UserLogin(BaseModel):
    email_or_phone: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    phone: Optional[str] = None
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    profile_image: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: str
    created_at: datetime
    profile_image: Optional[str] = None

# Post Models
class PostCreate(BaseModel):
    content: str
    image: Optional[str] = None  # base64 encoded image

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0
    comments: int = 0

class PostResponse(BaseModel):
    id: str
    user: UserResponse
    content: str
    image: Optional[str] = None
    created_at: datetime
    likes: int
    comments: int

# House Price Models
class HousePrice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    city: str
    county: str
    latitude: float
    longitude: float
    avg_price: int
    price_range: str

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# House Search Models
class HouseSearchFilters(BaseModel):
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    neighborhood: Optional[str] = None
    lot_shape: Optional[str] = None

class HouseSearchResult(BaseModel):
    saleprice: int
    lotshape: str
    fullbath: int
    bedroomabvgr: int
    neighborhood: str

class PriceStats(BaseModel):
    min_price: int
    max_price: int
    avg_price: int
    median_price: int
    total_houses: int

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def is_valid_email(email: str) -> bool:
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) is not None

def is_valid_phone(phone: str) -> bool:
    return re.match(r'^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$', phone) is not None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserResponse(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Authentication Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Validate input
    if not user_data.email and not user_data.phone:
        raise HTTPException(status_code=400, detail="Either email or phone is required")
    
    if user_data.email and not is_valid_email(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if user_data.phone and not is_valid_phone(user_data.phone):
        raise HTTPException(status_code=400, detail="Invalid phone format")
    
    # Check if user already exists
    existing_user = None
    if user_data.email:
        existing_user = await db.users.find_one({"email": user_data.email})
    if not existing_user and user_data.phone:
        existing_user = await db.users.find_one({"phone": user_data.phone})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        phone=user_data.phone,
        name=user_data.name
    )
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user.dict())
    )

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user by email or phone
    user = None
    if is_valid_email(user_data.email_or_phone):
        user = await db.users.find_one({"email": user_data.email_or_phone})
    elif is_valid_phone(user_data.email_or_phone):
        user = await db.users.find_one({"phone": user_data.email_or_phone})
    else:
        raise HTTPException(status_code=400, detail="Invalid email or phone format")
    
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

# Post Routes
@api_router.post("/posts", response_model=PostResponse)
async def create_post(post_data: PostCreate, current_user: UserResponse = Depends(get_current_user)):
    post = Post(
        user_id=current_user.id,
        content=post_data.content,
        image=post_data.image
    )
    
    await db.posts.insert_one(post.dict())
    
    return PostResponse(
        **post.dict(),
        user=current_user
    )

@api_router.get("/posts", response_model=List[PostResponse])
async def get_posts(skip: int = 0, limit: int = 20):
    posts = await db.posts.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get user data for each post
    post_responses = []
    for post in posts:
        user = await db.users.find_one({"id": post["user_id"]})
        if user:
            post_responses.append(PostResponse(
                **post,
                user=UserResponse(**user)
            ))
    
    return post_responses

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: UserResponse = Depends(get_current_user)):
    # Check if post exists
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already liked this post
    existing_like = await db.likes.find_one({"post_id": post_id, "user_id": current_user.id})
    
    if existing_like:
        # Unlike the post
        await db.likes.delete_one({"post_id": post_id, "user_id": current_user.id})
        await db.posts.update_one({"id": post_id}, {"$inc": {"likes": -1}})
        return {"liked": False}
    else:
        # Like the post
        await db.likes.insert_one({
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": current_user.id,
            "created_at": datetime.utcnow()
        })
        await db.posts.update_one({"id": post_id}, {"$inc": {"likes": 1}})
        return {"liked": True}

# House Search Routes
@api_router.get("/houses/search", response_model=List[HouseSearchResult])
async def search_houses(
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    neighborhood: Optional[str] = None,
    lot_shape: Optional[str] = None
):
    """Search houses with filters"""
    filters = {
        'min_price': min_price,
        'max_price': max_price,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'neighborhood': neighborhood,
        'lot_shape': lot_shape
    }
    
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    results = house_search.search_houses(filters)
    return [HouseSearchResult(**result) for result in results]

@api_router.post("/houses/search", response_model=List[HouseSearchResult])
async def search_houses_post(filters: HouseSearchFilters):
    """Search houses with POST request"""
    filter_dict = {k: v for k, v in filters.dict().items() if v is not None}
    results = house_search.search_houses(filter_dict)
    return [HouseSearchResult(**result) for result in results]

@api_router.get("/houses/price-range", response_model=List[HouseSearchResult])
async def get_houses_by_price_range(min_price: int, max_price: int):
    """Get houses by price range (original functionality)"""
    results = house_search.get_houses_by_price(min_price, max_price)
    return [HouseSearchResult(**result) for result in results]

@api_router.get("/houses/stats", response_model=PriceStats)
async def get_house_price_stats():
    """Get price statistics"""
    stats = house_search.get_price_stats()
    if not stats:
        raise HTTPException(status_code=500, detail="Unable to fetch price statistics")
    return PriceStats(**stats)

@api_router.get("/houses/neighborhoods", response_model=List[str])
async def get_neighborhoods():
    """Get list of all neighborhoods"""
    neighborhoods = house_search.get_all_neighborhoods()
    return neighborhoods

# House Price Routes
@api_router.get("/house-prices", response_model=List[HousePrice])
async def get_house_prices():
    prices = await db.house_prices.find().to_list(1000)
    return [HousePrice(**price) for price in prices]

@api_router.post("/house-prices/seed")
async def seed_house_prices():
    # Clear existing data
    await db.house_prices.delete_many({})
    
    # Sample Iowa house price data based on the map shown
    iowa_house_data = [
        # Major cities
        {"city": "Des Moines", "county": "Polk", "latitude": 41.5868, "longitude": -93.6250, "avg_price": 185000, "price_range": "$175,001 or more"},
        {"city": "Cedar Rapids", "county": "Linn", "latitude": 42.0080, "longitude": -91.6440, "avg_price": 155000, "price_range": "$150,001 to 175,000"},
        {"city": "Davenport", "county": "Scott", "latitude": 41.5236, "longitude": -90.5776, "avg_price": 135000, "price_range": "$125,001 to 150,000"},
        {"city": "Sioux City", "county": "Woodbury", "latitude": 42.4959, "longitude": -96.4003, "avg_price": 125000, "price_range": "$125,001 to 150,000"},
        {"city": "Council Bluffs", "county": "Pottawattamie", "latitude": 41.2619, "longitude": -95.8608, "avg_price": 115000, "price_range": "$100,001 to 125,000"},
        {"city": "Fort Dodge", "county": "Webster", "latitude": 42.4974, "longitude": -94.1683, "avg_price": 95000, "price_range": "$100,000 or less"},
        {"city": "Pleasant Hill", "county": "Polk", "latitude": 41.5847, "longitude": -93.5163, "avg_price": 195000, "price_range": "$175,001 or more"},
        
        # Smaller cities and towns - $100,000 or less (blue dots)
        {"city": "Ames", "county": "Story", "latitude": 42.0308, "longitude": -93.6319, "avg_price": 85000, "price_range": "$100,000 or less"},
        {"city": "Mason City", "county": "Cerro Gordo", "latitude": 43.1535, "longitude": -93.2008, "avg_price": 90000, "price_range": "$100,000 or less"},
        {"city": "Burlington", "county": "Des Moines", "latitude": 40.8076, "longitude": -91.1129, "avg_price": 88000, "price_range": "$100,000 or less"},
        {"city": "Ottumwa", "county": "Wapello", "latitude": 41.0197, "longitude": -92.4088, "avg_price": 75000, "price_range": "$100,000 or less"},
        {"city": "Marshalltown", "county": "Marshall", "latitude": 42.0494, "longitude": -92.9079, "avg_price": 82000, "price_range": "$100,000 or less"},
        {"city": "Clinton", "county": "Clinton", "latitude": 41.8444, "longitude": -90.1887, "avg_price": 78000, "price_range": "$100,000 or less"},
        {"city": "Keokuk", "county": "Lee", "latitude": 40.3972, "longitude": -91.3849, "avg_price": 72000, "price_range": "$100,000 or less"},
        
        # $100,001 to 125,000 (teal dots)
        {"city": "West Des Moines", "county": "Polk", "latitude": 41.5772, "longitude": -93.7414, "avg_price": 115000, "price_range": "$100,001 to 125,000"},
        {"city": "Ankeny", "county": "Polk", "latitude": 41.7297, "longitude": -93.6055, "avg_price": 118000, "price_range": "$100,001 to 125,000"},
        {"city": "Urbandale", "county": "Polk", "latitude": 41.6266, "longitude": -93.7122, "avg_price": 112000, "price_range": "$100,001 to 125,000"},
        {"city": "Bettendorf", "county": "Scott", "latitude": 41.5244, "longitude": -90.5151, "avg_price": 120000, "price_range": "$100,001 to 125,000"},
        {"city": "Newton", "county": "Jasper", "latitude": 41.6997, "longitude": -93.0477, "avg_price": 108000, "price_range": "$100,001 to 125,000"},
        
        # $125,001 to 150,000 (green dots)
        {"city": "Waukee", "county": "Dallas", "latitude": 41.6116, "longitude": -93.8516, "avg_price": 140000, "price_range": "$125,001 to 150,000"},
        {"city": "Clive", "county": "Polk", "latitude": 41.6044, "longitude": -93.7244, "avg_price": 135000, "price_range": "$125,001 to 150,000"},
        {"city": "Johnston", "county": "Polk", "latitude": 41.6736, "longitude": -93.6977, "avg_price": 145000, "price_range": "$125,001 to 150,000"},
        {"city": "Altoona", "county": "Polk", "latitude": 41.6430, "longitude": -93.4691, "avg_price": 130000, "price_range": "$125,001 to 150,000"},
        
        # $150,001 to 175,000 (dark green dots)
        {"city": "Windsor Heights", "county": "Polk", "latitude": 41.5997, "longitude": -93.7116, "avg_price": 165000, "price_range": "$150,001 to 175,000"},
        {"city": "Norwalk", "county": "Warren", "latitude": 41.4778, "longitude": -93.6819, "avg_price": 160000, "price_range": "$150,001 to 175,000"},
        {"city": "Indianola", "county": "Warren", "latitude": 41.3581, "longitude": -93.5574, "avg_price": 155000, "price_range": "$150,001 to 175,000"},
        
        # $175,001 or more (orange/red dots)
        {"city": "Cumming", "county": "Warren", "latitude": 41.4694, "longitude": -93.7355, "avg_price": 185000, "price_range": "$175,001 or more"},
        {"city": "Bondurant", "county": "Polk", "latitude": 41.7011, "longitude": -93.4641, "avg_price": 190000, "price_range": "$175,001 or more"},
        {"city": "Grimes", "county": "Polk", "latitude": 41.6869, "longitude": -93.7916, "avg_price": 195000, "price_range": "$175,001 or more"},
    ]
    
    # Insert the house price data
    for house_data in iowa_house_data:
        house_price = HousePrice(**house_data)
        await db.house_prices.insert_one(house_price.dict())
    
    return {"message": f"Seeded {len(iowa_house_data)} house price records"}

# Legacy routes (keep for compatibility)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

@app.get("/")
async def root():
    return {"message": "Iowa House Prices Dashboard API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://frontend-fx0y.onrender.com",
        "http://localhost:3000"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
