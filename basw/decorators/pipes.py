"""
Pipes - Transform and validate data.

Better than NestJS:
- Pydantic integration (best validation library)
- Type-safe
- Async support
- Automatic OpenAPI schema
"""

from typing import Callable, Any, List, Type, Optional
from functools import wraps
from abc import ABC, abstractmethod
from pydantic import BaseModel, ValidationError
from basw.common.exceptions import ValidationException


PIPES_METADATA = "__pipes__"


class Pipe(ABC):
    """
    Base class for pipes.

    Example:
        class ParseIntPipe(Pipe):
            async def transform(self, value: Any, metadata: dict) -> Any:
                try:
                    return int(value)
                except ValueError:
                    raise ValidationException([{"field": metadata.get("param"), "error": "Must be an integer"}])
    """

    @abstractmethod
    async def transform(self, value: Any, metadata: dict) -> Any:
        """
        Transform and validate the value.

        Args:
            value: The input value
            metadata: Information about the parameter

        Returns:
            Transformed value

        Raises:
            ValidationException: If validation fails
        """
        pass


def UsePipes(*pipes: Type[Pipe]):
    """
    Apply pipes to a route parameter or entire route.

    Example:
        @Get("/:id")
        async def get_user(self, id: int = UsePipes(ParseIntPipe)):
            return {"id": id}
    """

    def decorator(target: Callable | Type) -> Callable | Type:
        if isinstance(target, type):
            setattr(target, PIPES_METADATA, list(pipes))
            return target
        else:
            if not hasattr(target, PIPES_METADATA):
                setattr(target, PIPES_METADATA, [])

            existing = getattr(target, PIPES_METADATA)
            setattr(target, PIPES_METADATA, existing + list(pipes))

            @wraps(target)
            async def wrapper(*args, **kwargs):
                return await target(*args, **kwargs)

            setattr(wrapper, PIPES_METADATA, getattr(target, PIPES_METADATA))
            return wrapper

    return decorator


def get_pipes(target: Callable | Type) -> List[Type[Pipe]]:
    """Get pipes from a target."""
    return getattr(target, PIPES_METADATA, [])


# Built-in Pipes


class ValidationPipe(Pipe):
    """
    Validate data against a Pydantic model.

    This is automatically applied when using Pydantic models in route parameters.
    """

    def __init__(self, model: Type[BaseModel]):
        self.model = model

    async def transform(self, value: Any, metadata: dict) -> Any:
        try:
            if isinstance(value, dict):
                return self.model(**value)
            elif isinstance(value, self.model):
                return value
            else:
                return self.model(value)
        except ValidationError as e:
            errors = [
                {
                    "field": ".".join(str(loc) for loc in err["loc"]),
                    "message": err["msg"],
                    "type": err["type"],
                }
                for err in e.errors()
            ]
            raise ValidationException(errors)


class ParseIntPipe(Pipe):
    """Parse value to integer."""

    async def transform(self, value: Any, metadata: dict) -> int:
        try:
            return int(value)
        except (ValueError, TypeError):
            raise ValidationException([
                {
                    "field": metadata.get("param", "value"),
                    "message": "Must be a valid integer",
                }
            ])


class ParseFloatPipe(Pipe):
    """Parse value to float."""

    async def transform(self, value: Any, metadata: dict) -> float:
        try:
            return float(value)
        except (ValueError, TypeError):
            raise ValidationException([
                {
                    "field": metadata.get("param", "value"),
                    "message": "Must be a valid number",
                }
            ])


class ParseBoolPipe(Pipe):
    """Parse value to boolean."""

    async def transform(self, value: Any, metadata: dict) -> bool:
        if isinstance(value, bool):
            return value

        if isinstance(value, str):
            value_lower = value.lower()
            if value_lower in ("true", "1", "yes", "y"):
                return True
            if value_lower in ("false", "0", "no", "n"):
                return False

        raise ValidationException([
            {
                "field": metadata.get("param", "value"),
                "message": "Must be a valid boolean",
            }
        ])


class DefaultValuePipe(Pipe):
    """Provide default value if none exists."""

    def __init__(self, default: Any):
        self.default = default

    async def transform(self, value: Any, metadata: dict) -> Any:
        return value if value is not None else self.default
