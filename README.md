# BASW Framework

**Backend Architecture for Swift Web Development**

A comprehensive FastAPI framework inspired by NestJS, but better in every way. Built for Python developers who love the architectural patterns of NestJS but want the power and simplicity of FastAPI.

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Why BASW is Better Than NestJS

| Feature | BASW | NestJS |
|---------|------|---------|
| **Performance** | ⚡ FastAPI (async Python) | Node.js (single-threaded) |
| **Type System** | 🔷 Python type hints + Pydantic | TypeScript |
| **Validation** | ✅ Pydantic (best in class) | class-validator |
| **Documentation** | 📚 Automatic OpenAPI/Swagger | Manual setup needed |
| **Dependency Injection** | 🎯 Full DI container | ✓ DI container |
| **Decorators** | ✓ @Controller, @Injectable, etc. | ✓ @Controller, @Injectable, etc. |
| **Guards** | ✓ Route protection | ✓ Route protection |
| **Interceptors** | ✓ Request/response transformation | ✓ Request/response transformation |
| **Pipes** | ✓ Validation & transformation | ✓ Validation & transformation |
| **WebSockets** | ✓ Native FastAPI support | ✓ Socket.io |
| **Testing** | 🧪 pytest + async support | Jest |
| **CLI** | 🛠️ Rich CLI with scaffolding | NestJS CLI |
| **Learning Curve** | 📖 Python (easier) | TypeScript + RxJS |
| **Ecosystem** | 🐍 Python packages | npm packages |

## Features

### 🎯 Core Features

- **Dependency Injection**: Advanced DI container with automatic resolution, circular dependency detection, and scope management
- **Decorators**: NestJS-like decorators (@Controller, @Injectable, @Module, etc.)
- **Modular Architecture**: Organize your application into reusable modules
- **Type-Safe**: Full Python type hints with Pydantic validation
- **Automatic Documentation**: OpenAPI/Swagger docs out of the box

### 🛡️ Security & Control

- **Guards**: Protect routes with authentication and authorization
- **Interceptors**: Transform requests and responses
- **Pipes**: Validate and transform data
- **Exception Filters**: Handle errors gracefully
- **Middleware**: ASGI middleware support

### 🚀 Advanced Features

- **Event System**: Event-driven architecture with emitters and listeners
- **WebSocket Support**: Real-time communication with decorators
- **Caching**: Built-in caching with multiple backends (in-memory, Redis)
- **Health Checks**: Monitor application health
- **Configuration Management**: Environment-based config with Pydantic Settings
- **CLI Tool**: Scaffold projects and generate components

### 🧪 Testing

- **TestClient**: Easy-to-use testing utilities
- **Mocking**: Override providers for testing
- **Async Support**: Full async/await testing support

## Installation

```bash
pip install basw
```

Or install from source:

```bash
git clone https://github.com/yourusername/basw-framework.git
cd basw-framework
pip install -e .
```

## Quick Start

### 1. Create a new project

```bash
basw new my-api
cd my-api
pip install -r requirements.txt
```

### 2. Run the application

```bash
basw run
```

### 3. Open your browser

Visit http://localhost:3000/docs to see the automatic API documentation.

## Usage Examples

### Basic Controller

```python
from basw import Controller, Get, Post, Injectable
from pydantic import BaseModel

class CreateUserDto(BaseModel):
    username: str
    email: str

@Injectable()
class UserService:
    def __init__(self):
        self.users = []

    async def create_user(self, dto: CreateUserDto):
        user = {"id": len(self.users) + 1, **dto.dict()}
        self.users.append(user)
        return user

@Controller("/users")
class UserController:
    def __init__(self, user_service: UserService):
        self.user_service = user_service

    @Get()
    async def get_all(self):
        return {"users": self.user_service.users}

    @Post()
    async def create(self, dto: CreateUserDto):
        return await self.user_service.create_user(dto)
```

### Module Definition

```python
from basw import Module

@Module(
    controllers=[UserController],
    providers=[UserService],
    exports=[UserService],
)
class UserModule:
    pass
```

### Guards (Authentication)

```python
from basw.decorators.guards import Guard, UseGuards, ExecutionContext
from basw.common.exceptions import UnauthorizedException

class AuthGuard(Guard):
    async def can_activate(self, context: ExecutionContext) -> bool:
        request = context.get_request()
        token = request.headers.get("authorization")

        if not token:
            raise UnauthorizedException("Missing authorization token")

        # Validate token (simplified)
        return token.startswith("Bearer ")

@Controller("/admin")
@UseGuards(AuthGuard)
class AdminController:
    @Get()
    async def get_data(self):
        return {"data": "secret"}
```

### Interceptors

```python
from basw.decorators.interceptors import Interceptor, UseInterceptors, ExecutionContext
import time

class PerformanceInterceptor(Interceptor):
    async def intercept(self, context: ExecutionContext, next_handler):
        start = time.time()
        result = await next_handler()
        duration = time.time() - start

        print(f"Request took {duration:.2f}s")
        return result

@Controller("/api")
@UseInterceptors(PerformanceInterceptor)
class ApiController:
    # All routes will have performance monitoring
    pass
```

### Event System

```python
from basw import Injectable
from basw.decorators.events import OnEvent, get_event_emitter, Event

@Injectable()
class UserService:
    async def create_user(self, data):
        user = {"id": 1, **data}

        # Emit event
        emitter = get_event_emitter()
        await emitter.emit("user.created", user)

        return user

@Injectable()
class NotificationService:
    @OnEvent("user.created")
    async def handle_user_created(self, event: Event):
        user = event.data
        print(f"Sending welcome email to {user['email']}")
```

### WebSocket Support

```python
from basw.decorators.websocket import WebSocketGateway, SubscribeMessage, ConnectionManager
from fastapi import WebSocket

@WebSocketGateway("/chat")
class ChatGateway:
    def __init__(self):
        self.manager = ConnectionManager()

    @SubscribeMessage("message")
    async def handle_message(self, data: dict, websocket: WebSocket):
        await self.manager.broadcast({
            "event": "message",
            "data": data
        })
```

### Caching

```python
from basw.decorators.cache import Cacheable, CacheEvict

@Injectable()
class UserService:
    @Cacheable(ttl=300, key_prefix="users")
    async def get_all_users(self):
        # This result will be cached for 5 minutes
        return await db.users.find_all()

    @CacheEvict(key_prefix="users", all_entries=True)
    async def create_user(self, data):
        # This will invalidate the cache
        return await db.users.create(data)
```

### Health Checks

```python
from basw import Controller, Get
from basw.modules.health import HealthService, DiskHealthIndicator

@Controller("/health")
class HealthController:
    def __init__(self):
        self.health_service = HealthService()
        self.health_service.add_indicator("disk", DiskHealthIndicator())

    @Get()
    async def check(self):
        return await self.health_service.check()
```

### Testing

```python
import pytest
from basw.testing import TestClient

@pytest.mark.asyncio
async def test_user_creation():
    client = await TestClient.create(AppModule)

    response = client.post("/users", json={
        "username": "john",
        "email": "john@example.com"
    })

    assert response.status_code == 200
    assert response.json()["username"] == "john"

    await client.close()
```

## CLI Commands

```bash
# Create new project
basw new my-project

# Generate components
basw generate controller users
basw generate service auth
basw generate module database

# Run application
basw run

# Show framework info
basw info
```

## Project Structure

```
my-api/
├── src/
│   ├── controllers/        # HTTP route handlers
│   │   └── user_controller.py
│   ├── services/          # Business logic
│   │   └── user_service.py
│   ├── modules/           # Feature modules
│   │   └── user_module.py
│   ├── guards/            # Authentication/authorization
│   ├── interceptors/      # Request/response transformation
│   ├── pipes/             # Validation/transformation
│   ├── app_module.py      # Root module
│   └── main.py            # Application entry point
├── tests/                 # Test files
├── .env                   # Environment variables
├── requirements.txt       # Dependencies
└── README.md
```

## Architecture

### Dependency Injection

BASW uses a powerful DI container that automatically resolves dependencies:

```python
@Injectable()
class DatabaseService:
    pass

@Injectable()
class UserService:
    def __init__(self, db: DatabaseService):
        # DatabaseService is automatically injected
        self.db = db

@Controller("/users")
class UserController:
    def __init__(self, user_service: UserService):
        # UserService is automatically injected
        self.user_service = user_service
```

### Module System

Organize your application into cohesive modules:

```python
@Module(
    imports=[DatabaseModule, AuthModule],
    controllers=[UserController],
    providers=[UserService],
    exports=[UserService],  # Available to importing modules
)
class UserModule:
    pass
```

### Request Lifecycle

1. **Incoming Request**
2. **Middleware** - Global request processing
3. **Guards** - Authentication/authorization checks
4. **Interceptors (before)** - Transform request
5. **Pipes** - Validate/transform parameters
6. **Route Handler** - Your controller method
7. **Interceptors (after)** - Transform response
8. **Exception Filters** - Handle any errors
9. **Response** - Sent to client

## Configuration

Use Pydantic Settings for type-safe configuration:

```python
from basw.modules.config import Config
from pydantic import Field

class AppConfig(Config):
    database_url: str = Field(..., env="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379")
    secret_key: str = Field(..., env="SECRET_KEY")

    @property
    def is_production(self) -> bool:
        return self.environment == "production"
```

## Comparison with NestJS

If you're coming from NestJS, you'll feel right at home:

| NestJS | BASW |
|--------|------|
| `@Controller()` | `@Controller()` |
| `@Injectable()` | `@Injectable()` |
| `@Module()` | `@Module()` |
| `@Get()`, `@Post()` | `@Get()`, `@Post()` |
| `@UseGuards()` | `@UseGuards()` |
| `@UseInterceptors()` | `@UseInterceptors()` |
| `@UsePipes()` | `@UsePipes()` |
| `class-validator` | Pydantic (better!) |
| `EventEmitter` | `EventEmitter` (async!) |
| `@WebSocketGateway()` | `@WebSocketGateway()` |

## Performance

BASW is built on FastAPI, which is one of the fastest Python frameworks:

- **High Performance**: Comparable to NodeJS and Go
- **Async/Await**: Native async support throughout
- **Type Hints**: Better IDE support and fewer runtime errors
- **Pydantic**: Extremely fast validation and serialization

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [NestJS](https://nestjs.com/)
- Built on [FastAPI](https://fastapi.tiangolo.com/)
- Powered by [Pydantic](https://pydantic-docs.helpmanual.io/)

## Support

- 📚 [Documentation](https://github.com/yourusername/basw-framework/wiki)
- 💬 [Discussions](https://github.com/yourusername/basw-framework/discussions)
- 🐛 [Issues](https://github.com/yourusername/basw-framework/issues)

## Roadmap

- [x] Core framework with DI
- [x] Decorators (Controller, Injectable, Module, etc.)
- [x] Guards, Interceptors, Pipes, Filters
- [x] Event system
- [x] WebSocket support
- [x] Caching system
- [x] Health checks
- [x] CLI tool
- [x] Testing utilities
- [ ] Database decorators (TypeORM-like)
- [ ] GraphQL support
- [ ] Microservices support
- [ ] Task scheduling
- [ ] Rate limiting
- [ ] Documentation website

---

**Built with ❤️ by developers who love both Python and great architecture**
