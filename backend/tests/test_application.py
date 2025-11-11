"""Tests for Application class."""

import pytest
from basw import Application, Module, Controller, Get, Injectable


@Injectable()
class TestService:
    """Test service."""

    def get_message(self):
        return "Hello from TestService"


@Controller("/test")
class TestController:
    """Test controller."""

    def __init__(self, test_service: TestService):
        self.test_service = test_service

    @Get()
    async def root(self):
        return {"message": self.test_service.get_message()}


@Module(
    controllers=[TestController],
    providers=[TestService],
)
class TestModule:
    """Test module."""

    pass


@pytest.mark.asyncio
async def test_create_application():
    """Test creating an application."""
    app = await Application.create(TestModule, title="Test App")

    assert app is not None
    assert app.app is not None
    assert app.container is not None


@pytest.mark.asyncio
async def test_application_with_testclient():
    """Test application with TestClient."""
    from basw.testing import TestClient

    client = await TestClient.create(TestModule)

    response = client.get("/test")
    assert response.status_code == 200

    data = response.json()
    assert "message" in data
    assert data["message"] == "Hello from TestService"

    await client.close()
