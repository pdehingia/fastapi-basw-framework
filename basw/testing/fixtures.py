"""
Test Fixtures - Utilities for creating test modules and mocks.
"""

from typing import Type, List, Any, Dict
from basw.decorators.module import Module


def create_test_module(
    controllers: List[Type] = None,
    providers: List[Type | Dict] = None,
    imports: List[Type] = None,
) -> Type:
    """
    Create a test module dynamically.

    Example:
        TestModule = create_test_module(
            controllers=[UserController],
            providers=[UserService, MockDatabaseService],
        )
    """

    @Module(
        controllers=controllers or [],
        providers=providers or [],
        imports=imports or [],
    )
    class TestModule:
        pass

    return TestModule


def override_provider(token: Type, value: Any) -> Dict[str, Any]:
    """
    Create a provider override.

    Example:
        TestModule = create_test_module(
            providers=[
                UserService,
                override_provider(DatabaseService, MockDatabase()),
            ]
        )
    """
    return {"token": token, "use_value": value}
