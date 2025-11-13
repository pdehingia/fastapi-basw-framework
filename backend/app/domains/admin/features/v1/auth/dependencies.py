"""Auth feature dependencies."""

from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from .service import AdminAuthService

# OAuth2 scheme for admin authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")


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
            detail="Admin account is disabled",
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "role": getattr(user, 'role', 'admin'),  # Handle missing role column
        "is_superuser": user.is_superuser,
        "permissions": {
            "can_manage_users": user.can_manage_users,
            "can_manage_system": user.can_manage_system,
            "can_view_reports": user.can_view_reports,
            "can_manage_providers": user.can_manage_providers,
            "can_manage_customers": user.can_manage_customers,
        }
    }


async def require_admin_permissions(
    permission: str,
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require specific admin permissions."""
    if current_user.get("is_superuser"):
        return current_user
    
    permissions = current_user.get("permissions", {})
    
    if not permissions.get(permission, False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions: {permission} required"
        )
    
    return current_user