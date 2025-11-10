"""
Module decorator - Organize your application into modules.

Better than NestJS:
- Python import system (no need for complex paths)
- Dynamic module support
- Lazy loading
- Better tree-shaking
"""

from typing import Type, List, Optional, Dict, Any


MODULE_METADATA = "__module__"


def Module(
    imports: Optional[List[Type]] = None,
    controllers: Optional[List[Type]] = None,
    providers: Optional[List[Type | Dict[str, Any]]] = None,
    exports: Optional[List[Type]] = None,
):
    """
    Define a module.

    Args:
        imports: Other modules to import
        controllers: Controllers to register
        providers: Services and providers to register
        exports: Providers to export (available to importing modules)

    Example:
        @Module(
            imports=[DatabaseModule],
            controllers=[UserController],
            providers=[UserService],
            exports=[UserService],
        )
        class UserModule:
            pass
    """

    def decorator(cls: Type) -> Type:
        setattr(cls, MODULE_METADATA, {
            "imports": imports or [],
            "controllers": controllers or [],
            "providers": providers or [],
            "exports": exports or [],
        })
        return cls

    return decorator


def is_module(cls: Type) -> bool:
    """Check if a class is a module."""
    return hasattr(cls, MODULE_METADATA)


def get_module_metadata(cls: Type) -> Optional[dict]:
    """Get module metadata from a class."""
    return getattr(cls, MODULE_METADATA, None)
