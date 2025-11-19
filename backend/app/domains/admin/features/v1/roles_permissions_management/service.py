"""Roles & Permissions Service Layer."""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models.role import Role
from app.shared.models.permission import Permission
from app.shared.models.role_permission import RolePermission
from app.domains.admin.features.v1.roles_permissions_management.schemas import (
    RoleCreate,
    RoleUpdate,
    AssignPermissionsRequest,
    RoleStatistics
)


class RolesPermissionsService:
    """Service for managing roles and permissions."""

    def __init__(self, db: AsyncSession):
        """Initialize service."""
        self.db = db

    async def create_role(self, data: RoleCreate) -> Role:
        """Create new role."""
        role = Role(
            role_name=data.role_name,
            role_slug=data.role_slug,
            description=data.description,
            parent_role_id=data.parent_role_id,
            level=data.level,
            is_active=data.is_active,
            is_system_role=False
        )
        self.db.add(role)
        await self.db.flush()
        
        # Assign initial permissions if provided
        if data.permission_ids:
            for perm_id in data.permission_ids:
                role_perm = RolePermission(role_id=role.id, permission_id=perm_id)
                self.db.add(role_perm)
        
        await self.db.commit()
        await self.db.refresh(role)
        return role

    async def get_roles(
        self,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False,
        include_permissions: bool = False
    ) -> tuple[List[Role], int]:
        """Get paginated list of roles."""
        query = select(Role)
        
        if not include_inactive:
            query = query.where(Role.is_active == True)
        
        if include_permissions:
            query = query.options(
                selectinload(Role.role_permissions).selectinload(RolePermission.permission)
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(Role.level, Role.role_name).offset(skip).limit(limit)
        result = await self.db.execute(query)
        roles = result.scalars().all()
        
        return list(roles), total or 0

    async def get_role_by_id(self, role_id: int, include_permissions: bool = True) -> Optional[Role]:
        """Get role by ID."""
        query = select(Role).where(Role.id == role_id)
        
        if include_permissions:
            query = query.options(
                selectinload(Role.role_permissions).selectinload(RolePermission.permission)
            )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_role(self, role_id: int, data: RoleUpdate) -> Optional[Role]:
        """Update role."""
        role = await self.get_role_by_id(role_id, include_permissions=False)
        if not role:
            return None
        
        # Don't allow editing system roles
        if role.is_system_role:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(role, field, value)
        
        role.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(role)
        return role

    async def delete_role(self, role_id: int) -> bool:
        """Delete role."""
        role = await self.get_role_by_id(role_id, include_permissions=False)
        if not role:
            return False
        
        # Don't allow deleting system roles
        if role.is_system_role:
            return False
        
        await self.db.delete(role)
        await self.db.commit()
        return True

    async def get_permissions(
        self,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None
    ) -> tuple[List[Permission], int]:
        """Get paginated list of permissions."""
        query = select(Permission).where(Permission.is_active == True)
        
        if category:
            query = query.where(Permission.category == category)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(Permission.category, Permission.permission_name).offset(skip).limit(limit)
        result = await self.db.execute(query)
        permissions = result.scalars().all()
        
        return list(permissions), total or 0

    async def assign_permissions(self, role_id: int, request: AssignPermissionsRequest) -> Optional[Role]:
        """Assign permissions to role."""
        role = await self.get_role_by_id(role_id, include_permissions=False)
        if not role:
            return None
        
        # Don't allow editing system role permissions
        if role.is_system_role:
            return None
        
        # Add new permissions (skip if already exists due to unique constraint)
        for perm_id in request.permission_ids:
            # Check if mapping already exists
            existing = await self.db.execute(
                select(RolePermission).where(
                    and_(
                        RolePermission.role_id == role_id,
                        RolePermission.permission_id == perm_id
                    )
                )
            )
            if not existing.scalar_one_or_none():
                role_perm = RolePermission(role_id=role_id, permission_id=perm_id)
                self.db.add(role_perm)
        
        await self.db.commit()
        return await self.get_role_by_id(role_id, include_permissions=True)

    async def remove_permission(self, role_id: int, permission_id: int) -> bool:
        """Remove permission from role."""
        role = await self.get_role_by_id(role_id, include_permissions=False)
        if not role or role.is_system_role:
            return False
        
        result = await self.db.execute(
            select(RolePermission).where(
                and_(
                    RolePermission.role_id == role_id,
                    RolePermission.permission_id == permission_id
                )
            )
        )
        role_perm = result.scalar_one_or_none()
        if role_perm:
            await self.db.delete(role_perm)
            await self.db.commit()
            return True
        return False

    async def get_role_hierarchy(self) -> List[Role]:
        """Get role hierarchy tree."""
        query = select(Role).where(Role.is_active == True).order_by(Role.level, Role.role_name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_statistics(self) -> RoleStatistics:
        """Get roles and permissions statistics."""
        # Count roles
        roles_query = select(
            func.count(Role.id).label("total"),
            func.count(case((Role.is_active == True, 1))).label("active"),
            func.count(case((Role.is_active == False, 1))).label("inactive"),
            func.count(case((Role.is_system_role == True, 1))).label("system"),
            func.count(case((Role.is_system_role == False, 1))).label("custom")
        )
        
        roles_result = await self.db.execute(roles_query)
        roles_stats = roles_result.one()
        
        # Count roles with permissions
        roles_with_perms = await self.db.scalar(
            select(func.count(func.distinct(RolePermission.role_id)))
        )
        
        # Count permissions
        perms_query = select(
            func.count(Permission.id).label("total"),
            func.count(case((Permission.is_active == True, 1))).label("active")
        )
        
        perms_result = await self.db.execute(perms_query)
        perms_stats = perms_result.one()
        
        return RoleStatistics(
            total_roles=roles_stats.total or 0,
            active_roles=roles_stats.active or 0,
            inactive_roles=roles_stats.inactive or 0,
            system_roles=roles_stats.system or 0,
            custom_roles=roles_stats.custom or 0,
            roles_with_permissions=roles_with_perms or 0,
            total_permissions=perms_stats.total or 0,
            active_permissions=perms_stats.active or 0
        )
