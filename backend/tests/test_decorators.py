"""Tests for decorators."""

import pytest
from basw.decorators.controller import Controller, Get, Post, is_controller, get_routes
from basw.decorators.injectable import Injectable, is_injectable
from basw.decorators.module import Module, is_module, get_module_metadata
from basw.decorators.guards import Guard, UseGuards, get_guards


def test_injectable_decorator():
    """Test @Injectable decorator."""

    @Injectable()
    class MyService:
        pass

    assert is_injectable(MyService)


def test_controller_decorator():
    """Test @Controller decorator."""

    @Controller("/api")
    class MyController:
        @Get("/users")
        async def get_users(self):
            return []

    assert is_controller(MyController)
    routes = get_routes(MyController)
    assert len(routes) > 0


def test_module_decorator():
    """Test @Module decorator."""

    @Injectable()
    class MyService:
        pass

    @Controller("/api")
    class MyController:
        pass

    @Module(
        controllers=[MyController],
        providers=[MyService],
    )
    class MyModule:
        pass

    assert is_module(MyModule)
    metadata = get_module_metadata(MyModule)
    assert MyController in metadata["controllers"]
    assert MyService in metadata["providers"]


def test_guard_decorator():
    """Test @UseGuards decorator."""

    class AuthGuard(Guard):
        async def can_activate(self, context):
            return True

    @Controller("/api")
    @UseGuards(AuthGuard)
    class MyController:
        pass

    guards = get_guards(MyController)
    assert AuthGuard in guards


def test_multiple_http_methods():
    """Test multiple HTTP method decorators."""

    @Controller("/api")
    class MyController:
        @Get("/users")
        async def get_users(self):
            return []

        @Post("/users")
        async def create_user(self, data: dict):
            return data

    routes = get_routes(MyController)
    assert len(routes) >= 2

    methods = [r["method"] for r in routes]
    assert "GET" in methods
    assert "POST" in methods
