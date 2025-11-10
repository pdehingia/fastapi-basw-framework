"""
Test Client - Testing utilities for BASW applications.

Better than NestJS:
- Built on FastAPI TestClient (which uses HTTPX)
- Async support
- Type-safe
- Easy mocking/overriding
"""

from typing import Type, Any, Dict, Optional
from fastapi.testclient import TestClient as FastAPITestClient
from basw.core.application import Application
from basw.core.container import get_container


class TestClient:
    """
    Test client for BASW applications.

    Example:
        async def test_users():
            client = await TestClient.create(AppModule)

            response = client.get("/users")
            assert response.status_code == 200

            await client.close()
    """

    def __init__(self, app: Application):
        self.app = app
        self.fastapi_client = FastAPITestClient(app.get_app())
        self.container = app.container

    @classmethod
    async def create(
        cls,
        module: Type,
        overrides: Optional[Dict[Type, Any]] = None,
    ) -> "TestClient":
        """
        Create a test client from a module.

        Args:
            module: Root module to test
            overrides: Dictionary of providers to override

        Returns:
            TestClient instance
        """
        app = await Application.create(module)

        # Apply overrides
        if overrides:
            for token, value in overrides.items():
                app.container.register(token, use_value=value)

        return cls(app)

    def override_provider(self, token: Type, value: Any):
        """
        Override a provider for testing.

        Example:
            client.override_provider(DatabaseService, MockDatabaseService())
        """
        self.container.register(token, use_value=value)

    def get(self, url: str, **kwargs):
        """Send GET request."""
        return self.fastapi_client.get(url, **kwargs)

    def post(self, url: str, **kwargs):
        """Send POST request."""
        return self.fastapi_client.post(url, **kwargs)

    def put(self, url: str, **kwargs):
        """Send PUT request."""
        return self.fastapi_client.put(url, **kwargs)

    def patch(self, url: str, **kwargs):
        """Send PATCH request."""
        return self.fastapi_client.patch(url, **kwargs)

    def delete(self, url: str, **kwargs):
        """Send DELETE request."""
        return self.fastapi_client.delete(url, **kwargs)

    def websocket_connect(self, url: str):
        """Connect to WebSocket endpoint."""
        return self.fastapi_client.websocket_connect(url)

    async def close(self):
        """Close the test client."""
        self.fastapi_client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.fastapi_client.close()
