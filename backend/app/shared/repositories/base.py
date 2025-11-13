"""
Base repository pattern for shared database operations.
"""

from typing import TypeVar, Generic, List, Optional, Any, Dict
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.shared.exceptions import DatabaseError, NotFoundError


ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base repository with common CRUD operations.
    """

    def __init__(self, model: ModelType, db: Session = None):
        """
        Initialize repository with model and database session.
        
        Args:
            model: SQLAlchemy model class
            db: Database session (if None, will get from dependency)
        """
        self.model = model
        self._db = db

    @property
    def db(self) -> Session:
        """Get database session."""
        if self._db is None:
            return next(get_db())
        return self._db

    def get(self, id: UUID) -> Optional[ModelType]:
        """Get a single record by ID."""
        try:
            return self.db.query(self.model).filter(self.model.id == id).first()
        except Exception as e:
            raise DatabaseError(f"Failed to get {self.model.__name__}: {str(e)}")

    def get_or_404(self, id: UUID) -> ModelType:
        """Get a single record by ID or raise 404."""
        obj = self.get(id)
        if not obj:
            raise NotFoundError(f"{self.model.__name__} with id {id} not found")
        return obj

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all records with pagination."""
        try:
            return self.db.query(self.model).offset(skip).limit(limit).all()
        except Exception as e:
            raise DatabaseError(f"Failed to get all {self.model.__name__}: {str(e)}")

    def get_by_field(self, field_name: str, value: Any) -> Optional[ModelType]:
        """Get a single record by field value."""
        try:
            field = getattr(self.model, field_name)
            return self.db.query(self.model).filter(field == value).first()
        except Exception as e:
            raise DatabaseError(f"Failed to get {self.model.__name__} by {field_name}: {str(e)}")

    def get_multi_by_field(self, field_name: str, value: Any, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get multiple records by field value."""
        try:
            field = getattr(self.model, field_name)
            return self.db.query(self.model).filter(field == value).offset(skip).limit(limit).all()
        except Exception as e:
            raise DatabaseError(f"Failed to get multiple {self.model.__name__} by {field_name}: {str(e)}")

    def create(self, obj_in: CreateSchemaType) -> ModelType:
        """Create a new record."""
        try:
            obj_in_data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in.dict()
            db_obj = self.model(**obj_in_data)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except IntegrityError as e:
            self.db.rollback()
            raise DatabaseError(f"Integrity constraint failed: {str(e)}")
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create {self.model.__name__}: {str(e)}")

    def update(self, db_obj: ModelType, obj_in: UpdateSchemaType) -> ModelType:
        """Update an existing record."""
        try:
            obj_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
            for field, value in obj_data.items():
                setattr(db_obj, field, value)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update {self.model.__name__}: {str(e)}")

    def delete(self, id: UUID) -> bool:
        """Delete a record by ID."""
        try:
            db_obj = self.get(id)
            if not db_obj:
                return False
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete {self.model.__name__}: {str(e)}")

    def count(self) -> int:
        """Get total count of records."""
        try:
            return self.db.query(self.model).count()
        except Exception as e:
            raise DatabaseError(f"Failed to count {self.model.__name__}: {str(e)}")

    def exists(self, id: UUID) -> bool:
        """Check if record exists by ID."""
        try:
            return self.db.query(self.model).filter(self.model.id == id).first() is not None
        except Exception as e:
            raise DatabaseError(f"Failed to check existence of {self.model.__name__}: {str(e)}")

    def filter_by(self, **filters) -> List[ModelType]:
        """Filter records by multiple fields."""
        try:
            query = self.db.query(self.model)
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)
            return query.all()
        except Exception as e:
            raise DatabaseError(f"Failed to filter {self.model.__name__}: {str(e)}")