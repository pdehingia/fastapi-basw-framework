"""
Authentication service containing business logic.
"""

from datetime import timedelta
from sqlalchemy.orm import Session

from app.features.users.repository import UserRepository
from app.features.users.models import User
from app.features.auth.schemas import LoginRequest, TokenResponse
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, NotFoundException


class AuthService:
    """Service for authentication business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def authenticate_user(self, email: str, password: str) -> User:
        """
        Authenticate user by email and password.

        Args:
            email: User email
            password: Plain text password

        Returns:
            User model

        Raises:
            UnauthorizedException: If credentials are invalid
        """
        user = self.user_repository.get_by_email(email)

        if not user:
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("User account is inactive")

        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")

        return user

    def login(self, login_data: LoginRequest) -> TokenResponse:
        """
        Login user and generate tokens.

        Args:
            login_data: Login credentials

        Returns:
            Token response with access and refresh tokens

        Raises:
            UnauthorizedException: If credentials are invalid
        """
        # Authenticate user
        user = self.authenticate_user(login_data.email, login_data.password)

        # Create tokens
        token_data = {"sub": str(user.id), "email": user.email}

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """
        Generate new access token from refresh token.

        Args:
            refresh_token: Valid refresh token

        Returns:
            New token response

        Raises:
            UnauthorizedException: If refresh token is invalid
        """
        # Decode refresh token
        payload = decode_token(refresh_token)

        if not payload:
            raise UnauthorizedException("Invalid refresh token")

        # Verify token type
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")

        # Get user
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")

        user = self.user_repository.get_by_id(int(user_id))
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")

        # Create new tokens
        token_data = {"sub": str(user.id), "email": user.email}

        access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    def get_current_user(self, user_id: int) -> User:
        """
        Get current user from user ID.

        Args:
            user_id: User ID from token

        Returns:
            User model

        Raises:
            UnauthorizedException: If user not found or inactive
        """
        user = self.user_repository.get_by_id(user_id)

        if not user:
            raise UnauthorizedException("User not found")

        if not user.is_active:
            raise UnauthorizedException("User account is inactive")

        return user
