"""Tests for dependency injection container."""

import pytest
from basw.core.container import Container
from basw.decorators.injectable import Injectable


@Injectable()
class ServiceA:
    """Test service A."""

    def get_value(self):
        return "A"


@Injectable()
class ServiceB:
    """Test service B with dependency on A."""

    def __init__(self, service_a: ServiceA):
        self.service_a = service_a

    def get_value(self):
        return f"B-{self.service_a.get_value()}"


@pytest.mark.asyncio
async def test_container_register_and_resolve():
    """Test basic register and resolve."""
    container = Container()
    container.register_class(ServiceA)

    instance = await container.resolve(ServiceA)
    assert instance is not None
    assert instance.get_value() == "A"


@pytest.mark.asyncio
async def test_container_singleton_scope():
    """Test singleton scope returns same instance."""
    container = Container()
    container.register_class(ServiceA, scope="singleton")

    instance1 = await container.resolve(ServiceA)
    instance2 = await container.resolve(ServiceA)

    assert instance1 is instance2


@pytest.mark.asyncio
async def test_container_transient_scope():
    """Test transient scope returns different instances."""
    container = Container()
    container.register_class(ServiceA, scope="transient")

    instance1 = await container.resolve(ServiceA)
    instance2 = await container.resolve(ServiceA)

    assert instance1 is not instance2


@pytest.mark.asyncio
async def test_container_dependency_injection():
    """Test automatic dependency injection."""
    container = Container()
    container.register_class(ServiceA)
    container.register_class(ServiceB)

    instance = await container.resolve(ServiceB)
    assert instance.get_value() == "B-A"


@pytest.mark.asyncio
async def test_container_value_provider():
    """Test value provider."""
    container = Container()
    container.register("config", use_value={"db": "postgres"})

    value = await container.resolve("config")
    assert value == {"db": "postgres"}


@pytest.mark.asyncio
async def test_container_factory_provider():
    """Test factory provider."""
    container = Container()

    def factory(c):
        return {"timestamp": 123}

    container.register("timestamp", use_factory=factory)

    value = await container.resolve("timestamp")
    assert value["timestamp"] == 123
