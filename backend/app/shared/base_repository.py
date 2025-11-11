"""
Base repository pattern for database operations.
Provides common CRUD operations for all entities.
"""

from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime

from app.shared.base_models import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    """
    Base repository with common CRUD operations.

    Attributes:
        model: SQLAlchemy model class
        db: Database session
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository.

        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    def get_by_id(
        self,
        id: int,
        include_deleted: bool = False
    ) -> Optional[ModelType]:
        """
        Get entity by ID.

        Args:
            id: Entity ID
            include_deleted: Include soft-deleted records

        Returns:
            Entity or None if not found
        """
        query = self.db.query(self.model).filter(self.model.id == id)

        if not include_deleted:
            query = query.filter(self.model.is_deleted == False)

        return query.first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None
    ) -> List[ModelType]:
        """
        Get all entities with optional filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            include_deleted: Include soft-deleted records
            filters: Dictionary of field:value filters
            order_by: Field name to order by (prefix with - for descending)

        Returns:
            List of entities
        """
        query = self.db.query(self.model)

        # Apply soft delete filter
        if not include_deleted:
            query = query.filter(self.model.is_deleted == False)

        # Apply custom filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)

        # Apply ordering
        if order_by:
            if order_by.startswith('-'):
                field = order_by[1:]
                if hasattr(self.model, field):
                    query = query.order_by(getattr(self.model, field).desc())
            else:
                if hasattr(self.model, order_by):
                    query = query.order_by(getattr(self.model, order_by))

        return query.offset(skip).limit(limit).all()

    def count(
        self,
        include_deleted: bool = False,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Count entities with optional filtering.

        Args:
            include_deleted: Include soft-deleted records
            filters: Dictionary of field:value filters

        Returns:
            Count of entities
        """
        query = self.db.query(self.model)

        if not include_deleted:
            query = query.filter(self.model.is_deleted == False)

        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)

        return query.count()

    def create(self, entity: ModelType) -> ModelType:
        """
        Create new entity.

        Args:
            entity: Entity to create

        Returns:
            Created entity with ID
        """
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def create_many(self, entities: List[ModelType]) -> List[ModelType]:
        """
        Create multiple entities.

        Args:
            entities: List of entities to create

        Returns:
            List of created entities
        """
        self.db.add_all(entities)
        self.db.commit()
        for entity in entities:
            self.db.refresh(entity)
        return entities

    def update(self, entity: ModelType) -> ModelType:
        """
        Update existing entity.

        Args:
            entity: Entity to update

        Returns:
            Updated entity
        """
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, id: int, soft: bool = True) -> bool:
        """
        Delete entity (soft or hard delete).

        Args:
            id: Entity ID
            soft: Use soft delete if True, hard delete if False

        Returns:
            True if deleted, False if not found
        """
        entity = self.get_by_id(id, include_deleted=True)
        if not entity:
            return False

        if soft:
            entity.soft_delete()
            self.db.commit()
        else:
            self.db.delete(entity)
            self.db.commit()

        return True

    def delete_many(self, ids: List[int], soft: bool = True) -> int:
        """
        Delete multiple entities.

        Args:
            ids: List of entity IDs
            soft: Use soft delete if True

        Returns:
            Number of deleted entities
        """
        deleted = 0
        for id in ids:
            if self.delete(id, soft):
                deleted += 1
        return deleted

    def restore(self, id: int) -> bool:
        """
        Restore a soft-deleted entity.

        Args:
            id: Entity ID

        Returns:
            True if restored, False if not found
        """
        entity = self.get_by_id(id, include_deleted=True)
        if not entity or not entity.is_deleted:
            return False

        entity.restore()
        self.db.commit()
        return True

    def exists(self, id: int, include_deleted: bool = False) -> bool:
        """
        Check if entity exists.

        Args:
            id: Entity ID
            include_deleted: Include soft-deleted records

        Returns:
            True if exists, False otherwise
        """
        return self.get_by_id(id, include_deleted) is not None

    def find_one(
        self,
        filters: Dict[str, Any],
        include_deleted: bool = False
    ) -> Optional[ModelType]:
        """
        Find one entity by filters.

        Args:
            filters: Dictionary of field:value filters
            include_deleted: Include soft-deleted records

        Returns:
            Entity or None if not found
        """
        query = self.db.query(self.model)

        if not include_deleted:
            query = query.filter(self.model.is_deleted == False)

        for field, value in filters.items():
            if hasattr(self.model, field):
                query = query.filter(getattr(self.model, field) == value)

        return query.first()
