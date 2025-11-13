"""Admin authentication API endpoints."""

from datetime import timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from .schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminRegisterRequest,
    AdminUserResponse,
    Token,
)
from .service import AdminAuthService
from .dependencies import get_current_admin_user
from app.shared.exceptions import ValidationException

# OAuth2 scheme for admin authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")

router = APIRouter(prefix="/auth", tags=["admin-auth"])


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> AdminLoginResponse:
    """Authenticate admin user and return access token."""
    auth_service = AdminAuthService(db)
    
    try:
        user = await auth_service.authenticate_user(
            email=form_data.username,
            password=form_data.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin account is disabled",
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "domain": "admin",
                "role": user.role
            },
            expires_delta=access_token_expires
        )
        
        return AdminLoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=AdminUserResponse.from_orm(user)
        )
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Authentication failed")


@router.post("/register", response_model=AdminUserResponse)
async def admin_register(
    user_data: AdminRegisterRequest,
    db: Session = Depends(get_db)
) -> AdminUserResponse:
    """Register new admin user (super admin only)."""
    auth_service = AdminAuthService(db)
    
    try:
        # Check if user already exists
        existing_user = await auth_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new admin user
        user = await auth_service.create_admin_user(user_data)
        
        return AdminUserResponse.from_orm(user)
        
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: dict = Depends(get_current_admin_user),
) -> Token:
    """Refresh access token."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(current_user["id"]),
            "email": current_user["email"],
            "domain": "admin",
            "role": current_user["role"]
        },
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer"
    )


@router.get("/me", response_model=AdminUserResponse)
async def get_current_admin_profile(
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> AdminUserResponse:
    """Get current admin user profile."""
    auth_service = AdminAuthService(db)
    
    user = await auth_service.get_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return AdminUserResponse.from_orm(user)


# Dependency to get current admin user
async def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get current authenticated admin user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        domain: str = payload.get("domain")
        
        if user_id is None or domain != "admin":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    auth_service = AdminAuthService(db)
    user = await auth_service.get_user_by_id(user_id)
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "domain": "admin"
    }