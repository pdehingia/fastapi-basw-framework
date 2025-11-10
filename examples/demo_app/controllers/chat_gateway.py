"""
Chat Gateway - WebSocket example.

Demonstrates:
- WebSocket support
- Real-time communication
- Connection management
- Room/namespace support
"""

from basw.decorators.websocket import WebSocketGateway, SubscribeMessage, ConnectionManager
from fastapi import WebSocket


@WebSocketGateway("/chat")
class ChatGateway:
    """
    Chat WebSocket gateway.

    This demonstrates real-time communication with WebSockets.
    """

    def __init__(self):
        self.manager = ConnectionManager()

    @SubscribeMessage("join_room")
    async def handle_join_room(self, data: dict, websocket: WebSocket):
        """Handle user joining a room."""
        room = data.get("room", "general")
        self.manager.join_room(room, websocket)

        await self.manager.send_to_room(
            room,
            {
                "event": "user_joined",
                "data": {"room": room, "message": "A user joined the room"},
            },
        )

    @SubscribeMessage("leave_room")
    async def handle_leave_room(self, data: dict, websocket: WebSocket):
        """Handle user leaving a room."""
        room = data.get("room", "general")
        self.manager.leave_room(room, websocket)

        await self.manager.send_to_room(
            room,
            {
                "event": "user_left",
                "data": {"room": room, "message": "A user left the room"},
            },
        )

    @SubscribeMessage("message")
    async def handle_message(self, data: dict, websocket: WebSocket):
        """
        Handle chat message.

        Broadcasts message to all connected clients.
        """
        room = data.get("room", "general")
        message = data.get("message", "")

        await self.manager.send_to_room(
            room,
            {
                "event": "message",
                "data": {"room": room, "message": message},
            },
        )

    @SubscribeMessage("broadcast")
    async def handle_broadcast(self, data: dict, websocket: WebSocket):
        """Broadcast to all connections."""
        message = data.get("message", "")

        await self.manager.broadcast(
            {"event": "broadcast", "data": {"message": message}},
            exclude=websocket,
        )
