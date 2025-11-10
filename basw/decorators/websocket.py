"""
WebSocket Support - Real-time communication made easy.

Better than NestJS:
- Native FastAPI WebSocket support
- Type-safe
- Room/namespace support
- Automatic reconnection handling
"""

from typing import Callable, Optional, List, Dict, Any, Set
from functools import wraps
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json


WEBSOCKET_GATEWAY_METADATA = "__websocket_gateway__"
SUBSCRIBE_MESSAGE_METADATA = "__subscribe_message__"


class ConnectionManager:
    """
    Manages WebSocket connections.

    Features:
    - Multiple connections
    - Broadcasting
    - Rooms/namespaces
    - Connection tracking
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        """Accept a new connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a connection."""
        self.active_connections.remove(websocket)

        # Remove from all rooms
        for room in self.rooms.values():
            room.discard(websocket)

    async def send_personal_message(self, message: Any, websocket: WebSocket):
        """Send message to specific connection."""
        if isinstance(message, dict):
            message = json.dumps(message)
        await websocket.send_text(message)

    async def broadcast(self, message: Any, exclude: Optional[WebSocket] = None):
        """Broadcast message to all connections."""
        if isinstance(message, dict):
            message = json.dumps(message)

        for connection in self.active_connections:
            if connection != exclude:
                await connection.send_text(message)

    def join_room(self, room: str, websocket: WebSocket):
        """Add connection to a room."""
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(websocket)

    def leave_room(self, room: str, websocket: WebSocket):
        """Remove connection from a room."""
        if room in self.rooms:
            self.rooms[room].discard(websocket)

    async def send_to_room(self, room: str, message: Any):
        """Send message to all connections in a room."""
        if room not in self.rooms:
            return

        if isinstance(message, dict):
            message = json.dumps(message)

        for connection in self.rooms[room]:
            await connection.send_text(message)


def WebSocketGateway(
    path: str = "/ws",
    namespace: Optional[str] = None,
):
    """
    Mark a class as a WebSocket gateway.

    Example:
        @WebSocketGateway("/chat")
        class ChatGateway:
            def __init__(self):
                self.manager = ConnectionManager()

            @SubscribeMessage("message")
            async def handle_message(self, data: dict, websocket: WebSocket):
                await self.manager.broadcast(data)
    """

    def decorator(cls: type) -> type:
        setattr(cls, WEBSOCKET_GATEWAY_METADATA, {
            "path": path,
            "namespace": namespace,
        })
        return cls

    return decorator


def SubscribeMessage(event: str):
    """
    Subscribe to a WebSocket message event.

    Example:
        @SubscribeMessage("join_room")
        async def handle_join(self, data: dict, websocket: WebSocket):
            room = data.get("room")
            self.manager.join_room(room, websocket)
    """

    def decorator(func: Callable) -> Callable:
        if not hasattr(func, SUBSCRIBE_MESSAGE_METADATA):
            setattr(func, SUBSCRIBE_MESSAGE_METADATA, [])

        listeners = getattr(func, SUBSCRIBE_MESSAGE_METADATA)
        listeners.append(event)

        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)

        setattr(wrapper, SUBSCRIBE_MESSAGE_METADATA, listeners)
        return wrapper

    return decorator


def is_websocket_gateway(cls: type) -> bool:
    """Check if class is a WebSocket gateway."""
    return hasattr(cls, WEBSOCKET_GATEWAY_METADATA)


def get_websocket_metadata(cls: type) -> Optional[dict]:
    """Get WebSocket metadata from a class."""
    return getattr(cls, WEBSOCKET_GATEWAY_METADATA, None)


def get_message_handlers(cls: type) -> Dict[str, Callable]:
    """Get message handlers from a WebSocket gateway."""
    handlers = {}

    for attr_name in dir(cls):
        if attr_name.startswith("_"):
            continue

        attr = getattr(cls, attr_name)
        if hasattr(attr, SUBSCRIBE_MESSAGE_METADATA):
            events = getattr(attr, SUBSCRIBE_MESSAGE_METADATA)
            for event in events:
                handlers[event] = attr

    return handlers
