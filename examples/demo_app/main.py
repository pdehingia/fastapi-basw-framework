"""
Demo Application - Showcasing BASW Framework Features

This example demonstrates:
- Dependency Injection
- Controllers with decorators
- Guards for authentication
- Interceptors for logging
- Pipes for validation
- Exception filters
- Event system
- WebSocket support
- Caching
- Health checks
"""

from basw import Application
from examples.demo_app.app_module import AppModule


async def create_app():
    """Create the demo application."""
    app = await Application.create(
        AppModule,
        title="BASW Demo Application",
        description="Demonstrating all features of the BASW framework",
        version="1.0.0",
    )

    return app


if __name__ == "__main__":
    import asyncio

    async def main():
        basw_app = await create_app()
        basw_app.listen(3000)

    asyncio.run(main())
