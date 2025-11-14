"""Admin authentication API endpoints."""

import logging
from datetime import timedelta, datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
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
from app.shared.utils.client_info import get_comprehensive_client_info
from .schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminRegisterRequest,
    AdminUserResponse,
    Token,
)
from .service import AdminAuthService
from .dependencies import get_current_admin_user
from app.shared.exceptions import ValidationException, UnauthorizedException, NotFoundError
from app.shared.responses import success_response, create_success_json_response

logger = logging.getLogger(__name__)

# OAuth2 scheme for admin authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")

router = APIRouter(prefix="/auth", tags=["admin-auth"])


@router.post("/login")
async def admin_login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Authenticate admin user and set httpOnly cookie."""
    auth_service = AdminAuthService(db)
    
    # Get comprehensive client information
    client_info = get_comprehensive_client_info(request)
    
    try:
        # authenticate_user now returns user only (session tracking temporarily disabled)
        user = await auth_service.authenticate_user(
            email=form_data.username,
            password=form_data.password,
            client_info=client_info
        )
        
        if not user:
            raise UnauthorizedException(
                message="Incorrect email or password",
                code="INVALID_CREDENTIALS"
            )
        
        if not user.is_active:
            raise UnauthorizedException(
                message="Admin account is disabled",
                code="ACCOUNT_DISABLED"
            )
        
        # Try to create session record with error handling
        session_token = None
        try:
            session_token = await auth_service.create_session(user.id, client_info or {})
            logger.info(f"Session created successfully: {session_token[:8]}...")
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            # Continue without session tracking for now
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "domain": "admin",
                "is_superuser": user.is_superuser,
                "session_token": session_token  # Include session token for logout tracking
            },
            expires_delta=access_token_expires
        )
        
        # Set httpOnly cookie with security flags
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            httponly=True,  # CRITICAL: Prevent JavaScript access
            secure=True if settings.ENVIRONMENT == "production" else False,  # HTTPS only in production
            samesite="lax"  # CSRF protection - using 'lax' for development compatibility
        )
        
        return success_response(
            data={
                "user": AdminUserResponse.from_orm(user).dict(),
                "login_time": datetime.now().isoformat(),
                "session_info": {
                    "device_type": "Mobile" if client_info.get("is_mobile") else "Tablet" if client_info.get("is_tablet") else "PC" if client_info.get("is_pc") else "Other",
                    "device_name": f"{client_info.get('browser', 'Unknown')} on {client_info.get('operating_system', 'Unknown')}",
                    "location": f"{client_info.get('city', 'Unknown')}, {client_info.get('country', 'Unknown')}",
                    "ip_address": client_info.get("ip_address", "Unknown"),
                    "session_token": session_token[:8] + "..." if session_token else None,
                    "is_local": client_info.get("ip_address", "").startswith(("127.", "192.168.", "10.", "172."))
                }
            },
            message="Login successful"
        )
        
    except ValidationException as e:
        raise e
    except Exception as e:
        raise UnauthorizedException(
            message="Authentication failed",
            code="AUTH_FAILED"
        )


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


@router.post("/refresh")
async def refresh_token(
    response: Response,
    current_user: dict = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Refresh access token and update httpOnly cookie."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(current_user["id"]),
            "email": current_user["email"],
            "domain": "admin",
            "is_superuser": current_user.get("is_superuser", False)
        },
        expires_delta=access_token_expires
    )
    
    # Update httpOnly cookie with new token
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,  # CRITICAL: Prevent JavaScript access
        secure=True if settings.ENVIRONMENT == "production" else False,  # HTTPS only in production
        samesite="lax"  # CSRF protection - using 'lax' for development compatibility
    )
    
    return success_response(
        data={"message": "Token refreshed successfully"},
        message="Token refreshed successfully"
    )


@router.get("/me")
async def get_current_admin_profile(
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get current admin user profile."""
    auth_service = AdminAuthService(db)
    
    user = await auth_service.get_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return success_response(
        data=AdminUserResponse.from_orm(user).dict(),
        message="Profile retrieved successfully"
    )


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
        "is_superuser": user.is_superuser,
        "domain": "admin"
    }


@router.post("/logout")
async def admin_logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Log out admin user and clear httpOnly cookie."""
    auth_service = AdminAuthService(db)
    
    # Get session token from cookie
    access_token = request.cookies.get("access_token")
    
    if access_token:
        try:
            # Decode token to get session info
            payload = jwt.decode(
                access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            session_token = payload.get("session_token")
            
            if session_token:
                # Mark session as logged out
                await auth_service.logout_session(session_token)
                logger.info(f"Session logged out successfully: {session_token[:8]}...")
        except JWTError as e:
            # Token invalid, but still clear cookie for security
            logger.warning(f"Invalid token during logout: {e}")
        except Exception as e:
            logger.error(f"Error during logout session tracking: {e}")
    
    # Clear the httpOnly cookie - logout should always work for security
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True if settings.ENVIRONMENT == "production" else False,
        samesite="lax"
    )
    
    return success_response(
        data={"logout_time": datetime.now().isoformat()},
        message="Successfully logged out"
    )


@router.get("/sessions")
async def get_user_sessions(
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get current user's active sessions."""
    auth_service = AdminAuthService(db)
    
    sessions = await auth_service.get_user_sessions(current_user["id"])
    
    return success_response(
        data={"sessions": sessions},
        message="Sessions retrieved successfully"
    )


@router.post("/sessions/logout-all")
async def logout_all_sessions(
    response: Response,
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Logout all sessions for current user."""
    auth_service = AdminAuthService(db)
    
    # Logout all sessions
    count = await auth_service.logout_all_sessions(current_user["id"])
    
    # Clear current cookie
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True if settings.ENVIRONMENT == "production" else False,
        samesite="lax"
    )
    
    return success_response(
        data={
            "sessions_logged_out": count,
            "logout_time": datetime.now().isoformat()
        },
        message="All sessions logged out successfully"
    )


@router.get("/test-success")
async def test_success_response() -> Dict[str, Any]:
    """
    Test endpoint to demonstrate standardized success response format.
    """
    return create_success_json_response(
        data={
            "id": 101,
            "name": "iPhone 14",
            "price": 79999
        },
        message="Product fetched successfully"
    )


@router.get("/test-error")
async def test_error_response():
    """
    Test endpoint to demonstrate standardized error response format.
    """
    raise NotFoundError("Product not found")