"""
App Module - Root module for the demo application
"""

from basw import Module
from examples.demo_app.controllers.user_controller import UserController
from examples.demo_app.controllers.health_controller import HealthController
from examples.demo_app.controllers.chat_gateway import ChatGateway
from examples.demo_app.services.user_service import UserService
from examples.demo_app.services.notification_service import NotificationService
from basw.modules.config import ConfigService


@Module(
    controllers=[UserController, HealthController, ChatGateway],
    providers=[UserService, NotificationService, ConfigService],
)
class AppModule:
    """Root application module."""
    pass
