"""
Pytest configuration and fixtures.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.shared.models.base import Base

# Import only the models needed for basic admin auth tests
# (importing all models causes issues with PostgreSQL-specific types in SQLite)
# Excluding AdminAuditLog because it has JSONB columns incompatible with SQLite
from app.shared.models.user import AdminUser, AdminUserSession

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency with test database."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db():
    """Create test database and tables."""
    # Only create tables for models we actually need (admin_users, admin_user_sessions)
    # to avoid PostgreSQL-specific column types incompatible with SQLite
    AdminUser.__table__.create(bind=engine, checkfirst=True)
    AdminUserSession.__table__.create(bind=engine, checkfirst=True)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up only the tables we created
        AdminUserSession.__table__.drop(bind=engine, checkfirst=True)
        AdminUser.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture(scope="function")
def client(db, monkeypatch):
    """Create test client with database override and mocked audit logging."""
    # Import app after database is set up
    from app.main import app
    from app.domains.admin.features.v1.auth.service import AdminAuthService
    
    # Mock the _log_activity method to avoid audit log table dependency
    def mock_log_activity(self, user_id, action, details=None):
        """Mock audit logging - do nothing in tests"""
        pass
    
    monkeypatch.setattr(AdminAuthService, "_log_activity", mock_log_activity)
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Sample admin user data for testing."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "Test123!",  # Shorter password to avoid bcrypt issues
        "confirm_password": "Test123!",
        "first_name": "Test",
        "last_name": "User",
        "full_name": "Test User"
    }
