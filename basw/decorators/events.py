"""
Event System - Event-driven architecture made easy.

Better than NestJS:
- Type-safe events
- Async event handlers
- Priority support
- Event history tracking
"""

from typing import Callable, Any, Dict, List, Optional
from functools import wraps
from abc import ABC
import asyncio
from dataclasses import dataclass, field
from datetime import datetime


EVENT_LISTENER_METADATA = "__event_listeners__"


@dataclass
class Event:
    """Base class for events."""

    name: str
    data: Any
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


class EventEmitter:
    """
    Event emitter for publishing events.

    Better than Node.js EventEmitter:
    - Async by default
    - Type-safe
    - Priority support
    - Error handling
    """

    def __init__(self):
        self._listeners: Dict[str, List[tuple[Callable, int]]] = {}
        self._history: List[Event] = []
        self._max_history = 100

    def on(self, event: str, handler: Callable, priority: int = 0):
        """
        Register an event listener.

        Args:
            event: Event name to listen for
            handler: Async function to call when event is emitted
            priority: Higher priority handlers are called first
        """
        if event not in self._listeners:
            self._listeners[event] = []

        self._listeners[event].append((handler, priority))
        # Sort by priority (descending)
        self._listeners[event].sort(key=lambda x: x[1], reverse=True)

    def off(self, event: str, handler: Callable):
        """Remove an event listener."""
        if event in self._listeners:
            self._listeners[event] = [
                (h, p) for h, p in self._listeners[event] if h != handler
            ]

    async def emit(self, event: str, data: Any = None, **metadata):
        """
        Emit an event.

        Args:
            event: Event name
            data: Event data
            **metadata: Additional metadata
        """
        event_obj = Event(name=event, data=data, metadata=metadata)

        # Add to history
        self._history.append(event_obj)
        if len(self._history) > self._max_history:
            self._history.pop(0)

        # Call listeners
        if event in self._listeners:
            tasks = []
            for handler, _ in self._listeners[event]:
                if asyncio.iscoroutinefunction(handler):
                    tasks.append(handler(event_obj))
                else:
                    # Wrap sync function in async
                    tasks.append(asyncio.to_thread(handler, event_obj))

            # Wait for all handlers
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Log errors
            for result in results:
                if isinstance(result, Exception):
                    print(f"Error in event handler for '{event}': {result}")

    async def emit_async(self, event: str, data: Any = None, **metadata):
        """Alias for emit (for clarity)."""
        await self.emit(event, data, **metadata)

    def get_history(self, event: Optional[str] = None) -> List[Event]:
        """Get event history."""
        if event:
            return [e for e in self._history if e.name == event]
        return self._history


# Global event emitter
_global_emitter = EventEmitter()


def get_event_emitter() -> EventEmitter:
    """Get the global event emitter."""
    return _global_emitter


def OnEvent(event: str, priority: int = 0):
    """
    Decorator to mark a method as an event listener.

    Example:
        @Injectable()
        class UserService:
            @OnEvent("user.created")
            async def handle_user_created(self, event: Event):
                print(f"User created: {event.data}")
    """

    def decorator(func: Callable) -> Callable:
        if not hasattr(func, EVENT_LISTENER_METADATA):
            setattr(func, EVENT_LISTENER_METADATA, [])

        listeners = getattr(func, EVENT_LISTENER_METADATA)
        listeners.append({"event": event, "priority": priority})

        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)

        setattr(wrapper, EVENT_LISTENER_METADATA, listeners)
        return wrapper

    return decorator


def get_event_listeners(func: Callable) -> List[Dict]:
    """Get event listeners from a function."""
    return getattr(func, EVENT_LISTENER_METADATA, [])


# Utility decorators


def AsyncEvent(event_name: str):
    """
    Decorator to automatically emit an event after function execution.

    Example:
        @AsyncEvent("user.created")
        async def create_user(user_data: dict):
            # Create user...
            return user
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)

            # Emit event
            emitter = get_event_emitter()
            await emitter.emit(event_name, result)

            return result

        return wrapper

    return decorator
