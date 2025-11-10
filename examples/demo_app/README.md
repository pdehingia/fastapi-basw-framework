# BASW Demo Application

This demo application showcases all features of the BASW framework.

## Features Demonstrated

- ✅ Dependency Injection
- ✅ Controllers with HTTP decorators
- ✅ Guards for authentication
- ✅ Interceptors for logging/performance
- ✅ Pipes for validation
- ✅ Exception filters
- ✅ Event system (emitters/listeners)
- ✅ WebSocket support
- ✅ Caching system
- ✅ Health checks
- ✅ Pydantic validation

## Running the Demo

1. Install dependencies:
```bash
pip install -r ../../requirements.txt
```

2. Run the application:
```bash
python main.py
```

3. Open your browser:
- API Docs: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc
- Health Check: http://localhost:3000/health

## API Endpoints

### Users

- `GET /users` - Get all users (public)
- `GET /users/{id}` - Get user by ID (public)
- `POST /users` - Create user (requires auth)
- `PUT /users/{id}` - Update user (requires auth)
- `DELETE /users/{id}` - Delete user (requires auth)

### Health

- `GET /health` - Health check with indicators
- `GET /health/ping` - Simple ping

### WebSocket

- `WS /chat` - Chat WebSocket
  - Send: `{"event": "message", "data": {"room": "general", "message": "Hello"}}`
  - Send: `{"event": "join_room", "data": {"room": "general"}}`

## Testing the API

### Create a user (without auth - will fail)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "password123"}'
```

This will return 401 Unauthorized.

### Create a user (with auth)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"username": "john", "email": "john@example.com", "password": "password123"}'
```

### Get all users

```bash
curl http://localhost:3000/users
```

### Health check

```bash
curl http://localhost:3000/health
```

## WebSocket Testing

Use a WebSocket client or this JavaScript code:

```javascript
const ws = new WebSocket('ws://localhost:3000/chat');

ws.onmessage = (event) => {
    console.log('Received:', JSON.parse(event.data));
};

// Join a room
ws.send(JSON.stringify({
    event: 'join_room',
    data: { room: 'general' }
}));

// Send a message
ws.send(JSON.stringify({
    event: 'message',
    data: { room: 'general', message: 'Hello, World!' }
}));
```

## Architecture

```
demo_app/
├── controllers/
│   ├── user_controller.py     # REST API endpoints
│   ├── health_controller.py   # Health checks
│   └── chat_gateway.py        # WebSocket gateway
├── services/
│   ├── user_service.py        # User business logic
│   └── notification_service.py # Notifications
├── models/
│   └── user.py                # Pydantic models
├── app_module.py              # Root module
└── main.py                    # Entry point
```

## Key Concepts

### Dependency Injection

Services are automatically injected into controllers:

```python
@Controller("/users")
class UserController:
    def __init__(self, user_service: UserService):
        # UserService is automatically injected!
        self.user_service = user_service
```

### Event-Driven Architecture

Services can listen to and emit events:

```python
@Injectable()
class UserService:
    async def create_user(self, data):
        user = await self.db.create(data)

        # Emit event
        await get_event_emitter().emit("user.created", user)

        return user

@Injectable()
class NotificationService:
    @OnEvent("user.created")
    async def handle_user_created(self, event):
        # This is automatically called when user.created is emitted
        await self.send_welcome_email(event.data)
```

### Caching

Methods can be cached automatically:

```python
@Cacheable(ttl=300, key_prefix="users")
async def get_all_users(self):
    # This result is cached for 5 minutes
    return await self.db.find_all()
```

## Learn More

- [BASW Documentation](../../README.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
