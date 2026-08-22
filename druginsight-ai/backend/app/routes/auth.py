from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status

from app.database.mongodb import get_db
from app.models.schemas import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    db = get_db()
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "passwordHash": hash_password(payload.password),
        "createdAt": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    user = UserResponse(
        id=str(result.inserted_id),
        name=doc["name"],
        email=doc["email"],
        created_at=doc["createdAt"],
    )
    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_db()
    user_doc = await db.users.find_one({"email": payload.email.lower()})
    if not user_doc or not verify_password(payload.password, user_doc["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        created_at=user_doc["createdAt"],
    )
    token = create_access_token({"sub": str(user_doc["_id"])})
    return TokenResponse(access_token=token, user=user)


@router.post("/logout")
async def logout():
    return {"message": "Logged out. Discard client-side token."}
