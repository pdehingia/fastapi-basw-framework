"""
Database configuration and session management.
Supports both sync and async database operations for Maya Platform.
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from typing import Generator, AsyncGenerator
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# SQLAlchemy naming convention for constraints
# This ensures consistent naming across different databases
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)

# Create SQLAlchemy engine with PostgreSQL optimizations
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DB_ECHO,
    # PostgreSQL specific optimizations
    connect_args={
        "application_name": "maya_platform",
        "options": "-c timezone=UTC"
    }
)

# Create async engine for async operations
async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DB_ECHO,
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Create async session maker
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=async_engine,
    class_=AsyncSession,
)

# Create Base class for declarative models
Base = declarative_base(metadata=metadata)


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency.

    Yields a database session and ensures it's closed after use.
    Use this as a FastAPI dependency.

    Example:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async database session dependency.

    Yields an async database session and ensures it's closed after use.
    Use this as a FastAPI dependency for async operations.

    Example:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_async_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def init_db() -> None:
    """
    Initialize database.
    Creates all tables defined in models.

    Note: In production, use Alembic migrations instead.
    """
    logger.info("Initializing database...")
    
    # Import all models so they are registered with SQLAlchemy
    # This is required for Alembic to detect them
    import_all_models()
    
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")


def import_all_models():
    """
    Import all SQLAlchemy models to register them with the Base metadata.
    This ensures Alembic can detect all models for migration generation.
    """
    # Import all model files here
    # Note: In our case, we're using raw migrations, but this is good practice
    pass


def drop_db() -> None:
    """
    Drop all database tables.

    WARNING: This will delete all data!
    Use only in development/testing.
    """
    if settings.is_production:
        raise RuntimeError("Cannot drop database in production!")

    logger.warning("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    logger.info("Database dropped successfully")
