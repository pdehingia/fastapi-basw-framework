"""
Dependency Injection Container - The heart of BASW's DI system.
Inspired by NestJS but leveraging Python's dynamic nature.
"""

import inspect
from typing import Any, Dict, Type, Optional, Callable, get_type_hints
from functools import wraps
import asyncio


class InjectionToken:
    """Token for identifying injectable dependencies."""

    def __init__(self, name: str):
        self.name = name

    def __repr__(self):
        return f"InjectionToken({self.name})"


class Provider:
    """Represents a provider in the DI system."""

    def __init__(
        self,
        token: Type | InjectionToken | str,
        use_class: Optional[Type] = None,
        use_value: Optional[Any] = None,
        use_factory: Optional[Callable] = None,
        scope: str = "singleton",
    ):
        self.token = token
        self.use_class = use_class
        self.use_value = use_value
        self.use_factory = use_factory
        self.scope = scope


class Container:
    """
    Advanced Dependency Injection Container.

    Features:
    - Automatic dependency resolution
    - Circular dependency detection
    - Singleton and transient scopes
    - Factory providers
    - Value providers
    - Async support
    """

    def __init__(self):
        self._providers: Dict[Any, Provider] = {}
        self._instances: Dict[Any, Any] = {}
        self._resolving: set = set()

    def register(
        self,
        token: Type | InjectionToken | str,
        use_class: Optional[Type] = None,
        use_value: Optional[Any] = None,
        use_factory: Optional[Callable] = None,
        scope: str = "singleton",
    ):
        """Register a provider in the container."""
        provider = Provider(
            token=token,
            use_class=use_class,
            use_value=use_value,
            use_factory=use_factory,
            scope=scope,
        )
        self._providers[token] = provider

    def register_class(self, cls: Type, scope: str = "singleton"):
        """Register a class as a provider."""
        self.register(cls, use_class=cls, scope=scope)

    async def resolve(self, token: Type | InjectionToken | str) -> Any:
        """
        Resolve a dependency from the container.

        Supports:
        - Singleton instances (cached)
        - Transient instances (new each time)
        - Async factories
        - Automatic dependency injection
        """
        # Check for circular dependencies
        if token in self._resolving:
            raise ValueError(f"Circular dependency detected: {token}")

        # Return cached instance for singletons
        if token in self._instances:
            return self._instances[token]

        if token not in self._providers:
            raise ValueError(f"No provider found for token: {token}")

        provider = self._providers[token]

        # Mark as resolving
        self._resolving.add(token)

        try:
            instance = await self._create_instance(provider)

            # Cache singleton instances
            if provider.scope == "singleton":
                self._instances[token] = instance

            return instance
        finally:
            self._resolving.discard(token)

    async def _create_instance(self, provider: Provider) -> Any:
        """Create an instance from a provider."""
        # Value provider
        if provider.use_value is not None:
            return provider.use_value

        # Factory provider
        if provider.use_factory is not None:
            if asyncio.iscoroutinefunction(provider.use_factory):
                return await provider.use_factory(self)
            return provider.use_factory(self)

        # Class provider
        if provider.use_class is not None:
            return await self._instantiate_class(provider.use_class)

        raise ValueError(f"Invalid provider configuration for {provider.token}")

    async def _instantiate_class(self, cls: Type) -> Any:
        """Instantiate a class with dependency injection."""
        # Get constructor signature
        sig = inspect.signature(cls.__init__)

        # Get type hints for parameters
        try:
            hints = get_type_hints(cls.__init__)
        except Exception:
            hints = {}

        # Resolve dependencies
        kwargs = {}
        for param_name, param in sig.parameters.items():
            if param_name == "self":
                continue

            # Check if parameter has a type hint
            if param_name in hints:
                param_type = hints[param_name]

                # Handle Optional types
                if hasattr(param_type, "__origin__"):
                    if param_type.__origin__ is type(Optional):
                        param_type = param_type.__args__[0]

                # Resolve the dependency
                try:
                    kwargs[param_name] = await self.resolve(param_type)
                except ValueError:
                    # If dependency not found and has default, skip
                    if param.default is not inspect.Parameter.empty:
                        continue
                    raise
            elif param.default is inspect.Parameter.empty:
                raise ValueError(
                    f"Cannot resolve parameter '{param_name}' for {cls.__name__}. "
                    "Add type hint or default value."
                )

        return cls(**kwargs)

    def has(self, token: Type | InjectionToken | str) -> bool:
        """Check if a provider is registered."""
        return token in self._providers

    def clear(self):
        """Clear all providers and instances."""
        self._providers.clear()
        self._instances.clear()
        self._resolving.clear()


# Global container instance
_global_container = Container()


def get_container() -> Container:
    """Get the global container instance."""
    return _global_container


def inject(func: Callable) -> Callable:
    """
    Decorator to inject dependencies into a function.

    Example:
        @inject
        async def my_function(service: MyService):
            return await service.do_something()
    """
    sig = inspect.signature(func)
    hints = get_type_hints(func)

    @wraps(func)
    async def wrapper(*args, **kwargs):
        container = get_container()

        # Resolve dependencies
        for param_name, param in sig.parameters.items():
            if param_name in kwargs or param_name in ["self", "cls"]:
                continue

            if param_name in hints:
                param_type = hints[param_name]
                kwargs[param_name] = await container.resolve(param_type)

        if asyncio.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        return func(*args, **kwargs)

    return wrapper
