"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.auth.service import AuthService
from app.features.auth.schemas import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest
)
from app.features.users.service import UserService
from app.features.users.schemas import UserCreate, UserResponse
from app.shared.responses import MessageResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        Created user
    """
    service = UserService(db)
    user = service.create_user(user_data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login and get access tokens.

    Args:
        login_data: Login credentials
        db: Database session

    Returns:
        Access and refresh tokens
    """
    service = AuthService(db)
    tokens = service.login(login_data)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.

    Args:
        refresh_data: Refresh token
        db: Database session

    Returns:
        New access and refresh tokens
    """
    service = AuthService(db)
    tokens = service.refresh_access_token(refresh_data.refresh_token)
    return tokens


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout user.

    Note: With JWT tokens, logout is typically handled client-side
    by deleting the tokens. This endpoint is here for completeness.

    Returns:
        Success message
    """
    return MessageResponse(
        success=True,
        message="Logged out successfully"
    )
