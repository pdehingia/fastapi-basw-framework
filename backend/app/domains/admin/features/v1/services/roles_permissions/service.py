"""Roles and Permissions Management service."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime

from app.shared.models.role import Role
from app.shared.models.permission import Permission
from app.shared.models.role_permission import RolePermission
from app.shared.exceptions import NotFoundError, ValidationException, ConflictError
from app.shared.pagination import PaginationParams
from .schemas import (
    RoleCreate, RoleUpdate, RoleResponse, RoleWithPermissions,
    PermissionCreate, PermissionUpdate, PermissionResponse,
    RoleFilterParams, PermissionFilterParams,
    RoleListResponse, PermissionListResponse,
    RoleHierarchyNode, RoleStatistics, PermissionStatistics
)


class RolesPermissionsService:
    """Service for managing roles and permissions."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ===== ROLE CRUD OPERATIONS =====
    
    def create_role(self, role_data: RoleCreate) -> RoleResponse:
        """Create a new role."""
        # Check if role name or slug already exists
        existing_role = self.db.query(Role).filter(
            or_(
                Role.role_name == role_data.role_name,
                Role.role_slug == role_data.role_slug
            )
        ).first()
        
        if existing_role:
            if existing_role.role_name == role_data.role_name:
                raise ConflictError(f"Role with name '{role_data.role_name}' already exists")
            else:
                raise ConflictError(f"Role with slug '{role_data.role_slug}' already exists")
        
        # Validate parent role if provided
        if role_data.parent_role_id:
            parent_role = self.db.query(Role).filter(Role.id == role_data.parent_role_id).first()
            if not parent_role:
                raise NotFoundError(f"Parent role with ID {role_data.parent_role_id} not found")
            
            # Set level based on parent
            if role_data.level <= parent_role.level:
                role_data.level = parent_role.level + 1
        
        # Create role
        db_role = Role(**role_data.model_dump())
        self.db.add(db_role)
        self.db.commit()
        self.db.refresh(db_role)
        
        return RoleResponse.model_validate(db_role)
    
    def get_role_by_id(self, role_id: int) -> RoleResponse:
        """Get role by ID."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise NotFoundError(f"Role with ID {role_id} not found")
        
        return RoleResponse.model_validate(role)
    
    def get_role_with_permissions(self, role_id: int) -> RoleWithPermissions:
        """Get role with its permissions."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise NotFoundError(f"Role with ID {role_id} not found")
        
        # Get role permissions
        permissions = (
            self.db.query(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == role_id)
            .all()
        )
        
        role_dict = RoleResponse.model_validate(role).model_dump()
        role_dict['permissions'] = [PermissionResponse.model_validate(p) for p in permissions]
        
        return RoleWithPermissions(**role_dict)
    
    def get_roles_list(
        self,
        filters: RoleFilterParams,
        pagination: PaginationParams
    ) -> RoleListResponse:
        """Get paginated list of roles with filters."""
        query = self.db.query(Role)
        
        # Apply filters
        if filters.search:
            search_filter = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Role.role_name.ilike(search_filter),
                    Role.description.ilike(search_filter)
                )
            )
        
        if filters.is_active is not None:
            query = query.filter(Role.is_active == filters.is_active)
        
        if filters.is_system_role is not None:
            query = query.filter(Role.is_system_role == filters.is_system_role)
        
        if filters.parent_role_id is not None:
            query = query.filter(Role.parent_role_id == filters.parent_role_id)
        
        if filters.level is not None:
            query = query.filter(Role.level == filters.level)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        roles = query.offset(pagination.skip).limit(pagination.page_size).all()
        
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return RoleListResponse(
            roles=[RoleResponse.model_validate(r) for r in roles],
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages
        )
    
    def update_role(self, role_id: int, role_data: RoleUpdate) -> RoleResponse:
        """Update role."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise NotFoundError(f"Role with ID {role_id} not found")
        
        # Check if it's a system role
        if role.is_system_role:
            raise ValidationException("Cannot modify system roles")
        
        # Check for duplicate name if being updated
        if role_data.role_name and role_data.role_name != role.role_name:
            existing = self.db.query(Role).filter(Role.role_name == role_data.role_name).first()
            if existing:
                raise ConflictError(f"Role with name '{role_data.role_name}' already exists")
        
        # Validate parent role if being updated
        if role_data.parent_role_id and role_data.parent_role_id != role.parent_role_id:
            parent_role = self.db.query(Role).filter(Role.id == role_data.parent_role_id).first()
            if not parent_role:
                raise NotFoundError(f"Parent role with ID {role_data.parent_role_id} not found")
        
        # Update fields
        update_data = role_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(role, field, value)
        
        role.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(role)
        
        return RoleResponse.model_validate(role)
    
    def delete_role(self, role_id: int) -> bool:
        """Delete role (soft delete by deactivating)."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise NotFoundError(f"Role with ID {role_id} not found")
        
        # Check if it's a system role
        if role.is_system_role:
            raise ValidationException("Cannot delete system roles")
        
        # Check if role has child roles
        child_count = self.db.query(Role).filter(Role.parent_role_id == role_id).count()
        if child_count > 0:
            raise ValidationException(f"Cannot delete role with {child_count} child roles")
        
        # Deactivate instead of hard delete
        role.is_active = False
        role.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    # ===== PERMISSION CRUD OPERATIONS =====
    
    def create_permission(self, permission_data: PermissionCreate) -> PermissionResponse:
        """Create a new permission."""
        # Check if permission already exists
        existing = self.db.query(Permission).filter(
            or_(
                Permission.permission_name == permission_data.permission_name,
                Permission.permission_slug == permission_data.permission_slug
            )
        ).first()
        
        if existing:
            if existing.permission_name == permission_data.permission_name:
                raise ConflictError(f"Permission '{permission_data.permission_name}' already exists")
            else:
                raise ConflictError(f"Permission slug '{permission_data.permission_slug}' already exists")
        
        # Create permission
        db_permission = Permission(**permission_data.model_dump())
        self.db.add(db_permission)
        self.db.commit()
        self.db.refresh(db_permission)
        
        return PermissionResponse.model_validate(db_permission)
    
    def get_permissions_list(
        self,
        filters: PermissionFilterParams,
        pagination: PaginationParams
    ) -> PermissionListResponse:
        """Get paginated list of permissions with filters."""
        query = self.db.query(Permission)
        
        # Apply filters
        if filters.search:
            search_filter = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Permission.permission_name.ilike(search_filter),
                    Permission.description.ilike(search_filter)
                )
            )
        
        if filters.category:
            query = query.filter(Permission.category == filters.category)
        
        if filters.is_active is not None:
            query = query.filter(Permission.is_active == filters.is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        permissions = query.offset(pagination.skip).limit(pagination.page_size).all()
        
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return PermissionListResponse(
            permissions=[PermissionResponse.model_validate(p) for p in permissions],
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages
        )
    
    # ===== ROLE-PERMISSION OPERATIONS =====
    
    def assign_permissions_to_role(self, role_id: int, permission_ids: List[int]) -> RoleWithPermissions:
        """Assign multiple permissions to a role."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise NotFoundError(f"Role with ID {role_id} not found")
        
        # Get existing permission IDs for this role
        existing_permission_ids = {
            rp.permission_id for rp in 
            self.db.query(RolePermission).filter(RolePermission.role_id == role_id).all()
        }
        
        # Find new permissions to add
        new_permission_ids = set(permission_ids) - existing_permission_ids
        
        if new_permission_ids:
            # Verify all permissions exist
            permissions = self.db.query(Permission).filter(Permission.id.in_(new_permission_ids)).all()
            if len(permissions) != len(new_permission_ids):
                found_ids = {p.id for p in permissions}
                missing_ids = new_permission_ids - found_ids
                raise NotFoundError(f"Permissions not found: {missing_ids}")
            
            # Create associations
            for permission_id in new_permission_ids:
                role_permission = RolePermission(
                    role_id=role_id,
                    permission_id=permission_id
                )
                self.db.add(role_permission)
            
            self.db.commit()
        
        return self.get_role_with_permissions(role_id)
    
    def remove_permissions_from_role(self, role_id: int, permission_ids: List[int]) -> RoleWithPermissions:
        """Remove multiple permissions from a role."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise NotFoundError(f"Role with ID {role_id} not found")
        
        # Delete associations
        deleted = self.db.query(RolePermission).filter(
            and_(
                RolePermission.role_id == role_id,
                RolePermission.permission_id.in_(permission_ids)
            )
        ).delete(synchronize_session=False)
        
        self.db.commit()
        
        return self.get_role_with_permissions(role_id)
    
    def remove_single_permission_from_role(self, role_id: int, permission_id: int) -> bool:
        """Remove a single permission from a role."""
        role_permission = self.db.query(RolePermission).filter(
            and_(
                RolePermission.role_id == role_id,
                RolePermission.permission_id == permission_id
            )
        ).first()
        
        if not role_permission:
            raise NotFoundError(f"Permission {permission_id} not assigned to role {role_id}")
        
        self.db.delete(role_permission)
        self.db.commit()
        
        return True
    
    # ===== HIERARCHY & STATISTICS =====
    
    def get_role_hierarchy(self) -> List[RoleHierarchyNode]:
        """Get role hierarchy tree."""
        all_roles = self.db.query(Role).filter(Role.is_active == True).order_by(Role.level, Role.role_name).all()
        
        # Build hierarchy
        role_dict = {role.id: role for role in all_roles}
        root_roles = [role for role in all_roles if role.parent_role_id is None]
        
        def build_tree(role: Role) -> RoleHierarchyNode:
            children = [r for r in all_roles if r.parent_role_id == role.id]
            node = RoleHierarchyNode(
                id=role.id,
                role_name=role.role_name,
                role_slug=role.role_slug,
                level=role.level,
                children=[build_tree(child) for child in children]
            )
            return node
        
        return [build_tree(root) for root in root_roles]
    
    def get_role_statistics(self) -> RoleStatistics:
        """Get role statistics."""
        total_roles = self.db.query(Role).count()
        active_roles = self.db.query(Role).filter(Role.is_active == True).count()
        system_roles = self.db.query(Role).filter(Role.is_system_role == True).count()
        custom_roles = total_roles - system_roles
        
        # Roles by level
        roles_by_level = {}
        level_counts = self.db.query(
            Role.level, func.count(Role.id)
        ).group_by(Role.level).all()
        
        for level, count in level_counts:
            roles_by_level[f"level_{level}"] = count
        
        return RoleStatistics(
            total_roles=total_roles,
            active_roles=active_roles,
            system_roles=system_roles,
            custom_roles=custom_roles,
            roles_by_level=roles_by_level
        )
    
    def get_permission_statistics(self) -> PermissionStatistics:
        """Get permission statistics."""
        total_permissions = self.db.query(Permission).count()
        active_permissions = self.db.query(Permission).filter(Permission.is_active == True).count()
        
        # Permissions by category
        permissions_by_category = {}
        category_counts = self.db.query(
            Permission.category, func.count(Permission.id)
        ).group_by(Permission.category).all()
        
        for category, count in category_counts:
            permissions_by_category[category] = count
        
        return PermissionStatistics(
            total_permissions=total_permissions,
            active_permissions=active_permissions,
            permissions_by_category=permissions_by_category
        )
