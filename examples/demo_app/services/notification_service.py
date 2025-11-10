"""
Notification Service - Handles notifications.

Demonstrates:
- Injectable service
- Event listeners
"""

from basw import Injectable
from basw.decorators.events import OnEvent, Event


@Injectable()
class NotificationService:
    """Service for sending notifications."""

    async def send_welcome_email(self, user: dict):
        """Send welcome email to new user."""
        print(f"📧 Sending welcome email to {user['email']}")
        # In production, this would send an actual email
        return True

    @OnEvent("user.deleted")
    async def handle_user_deleted(self, event: Event):
        """Handle user deleted event."""
        user = event.data
        print(f"👋 User deleted: {user['username']}")
        # Could send farewell email, clean up resources, etc.

    @OnEvent("user.updated")
    async def handle_user_updated(self, event: Event):
        """Handle user updated event."""
        user = event.data
        print(f"✏️  User updated: {user['username']}")
