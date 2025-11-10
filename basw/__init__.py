"""
BASW - Backend Architecture for Swift Web Development

A comprehensive FastAPI framework inspired by NestJS, leveraging Python's strengths.
"""

from basw.core.application import Application
from basw.decorators.controller import Controller, Get, Post, Put, Delete, Patch
from basw.decorators.injectable import Injectable, Inject
from basw.decorators.module import Module
from basw.decorators.guards import UseGuards, Guard
from basw.decorators.interceptors import UseInterceptors, Interceptor
from basw.decorators.pipes import UsePipes, Pipe
from basw.decorators.exception import ExceptionFilter, Catch
from basw.decorators.middleware import Middleware
from basw.decorators.events import OnEvent, EventEmitter
from basw.decorators.websocket import WebSocketGateway, SubscribeMessage
from basw.decorators.cache import Cacheable, CacheEvict
from basw.common.exceptions import (
    HttpException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
)

__version__ = "0.1.0"
__all__ = [
    # Core
    "Application",
    # Decorators
    "Controller",
    "Get",
    "Post",
    "Put",
    "Delete",
    "Patch",
    "Injectable",
    "Inject",
    "Module",
    "UseGuards",
    "Guard",
    "UseInterceptors",
    "Interceptor",
    "UsePipes",
    "Pipe",
    "ExceptionFilter",
    "Catch",
    "Middleware",
    "OnEvent",
    "EventEmitter",
    "WebSocketGateway",
    "SubscribeMessage",
    "Cacheable",
    "CacheEvict",
    # Exceptions
    "HttpException",
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "NotFoundException",
    "ConflictException",
    "InternalServerErrorException",
]
