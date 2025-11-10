"""
Injectable decorator - Mark classes as injectable services.
"""

from typing import Type, Optional, Any
from functools import wraps


INJECTABLE_METADATA = "__injectable__"
INJECT_METADATA = "__inject__"


def Injectable(scope: str = "singleton"):
    """
    Mark a class as injectable.

    Args:
        scope: 'singleton' (default) or 'transient'

    Example:
        @Injectable()
        class MyService:
            def __init__(self, other_service: OtherService):
                self.other_service = other_service
    """

    def decorator(cls: Type) -> Type:
        setattr(cls, INJECTABLE_METADATA, {
            "scope": scope,
            "token": cls,
        })
        return cls

    return decorator


def Inject(token: Any):
    """
    Explicitly inject a dependency.

    Useful for injecting by token instead of type.

    Example:
        @Injectable()
        class MyService:
            def __init__(self, config = Inject("CONFIG")):
                self.config = config
    """

    class InjectionDescriptor:
        def __init__(self, token):
            self.token = token

    return InjectionDescriptor(token)


def is_injectable(cls: Type) -> bool:
    """Check if a class is injectable."""
    return hasattr(cls, INJECTABLE_METADATA)


def get_injectable_metadata(cls: Type) -> Optional[dict]:
    """Get injectable metadata from a class."""
    return getattr(cls, INJECTABLE_METADATA, None)
