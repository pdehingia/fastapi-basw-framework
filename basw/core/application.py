"""
Application - The main application class.

Better than NestJS:
- FastAPI integration (automatic OpenAPI, validation)
- Python's async/await
- Type hints everywhere
- Better performance
- Simpler configuration
"""

from typing import Type, Optional, List, Callable, Any
from fastapi import FastAPI, Request, Response, WebSocket
from fastapi.responses import JSONResponse
import inspect

from basw.core.container import Container, get_container
from basw.decorators.module import is_module, get_module_metadata
from basw.decorators.controller import (
    is_controller,
    get_controller_metadata,
    get_routes,
    ROUTE_METADATA,
)
from basw.decorators.injectable import is_injectable, get_injectable_metadata
from basw.decorators.guards import Guard, get_guards, ExecutionContext as GuardContext
from basw.decorators.interceptors import (
    Interceptor,
    get_interceptors,
    ExecutionContext as InterceptorContext,
)
from basw.decorators.exception import (
    ExceptionFilter,
    get_exception_filters,
    get_caught_exceptions,
)
from basw.decorators.websocket import (
    is_websocket_gateway,
    get_websocket_metadata,
    get_message_handlers,
)
from basw.decorators.events import get_event_listeners, get_event_emitter
from basw.common.exceptions import HttpException, UnauthorizedException


class Application:
    """
    Main application class for BASW framework.

    Example:
        app = Application.create(AppModule)
        app.listen(3000)
    """

    def __init__(self, fastapi_app: FastAPI, container: Container):
        self.app = fastapi_app
        self.container = container
        self._modules: List[Type] = []
        self._exception_handlers: List[tuple[Type[Exception], ExceptionFilter]] = []

    @classmethod
    async def create(
        cls,
        module: Type,
        title: str = "BASW Application",
        description: str = "Built with BASW Framework",
        version: str = "1.0.0",
        **fastapi_kwargs,
    ) -> "Application":
        """
        Create a new application from a root module.

        Args:
            module: Root module class
            title: Application title
            description: Application description
            version: Application version
            **fastapi_kwargs: Additional FastAPI arguments

        Returns:
            Application instance
        """
        # Create FastAPI app
        fastapi_app = FastAPI(
            title=title,
            description=description,
            version=version,
            **fastapi_kwargs,
        )

        # Create container
        container = get_container()

        # Create application
        app = cls(fastapi_app, container)

        # Load module
        await app._load_module(module)

        # Setup global exception handlers
        app._setup_global_exception_handlers()

        return app

    async def _load_module(self, module_cls: Type):
        """Load a module and all its dependencies."""
        if not is_module(module_cls):
            raise ValueError(f"{module_cls.__name__} is not a valid module")

        if module_cls in self._modules:
            return  # Already loaded

        self._modules.append(module_cls)

        metadata = get_module_metadata(module_cls)

        # Load imported modules first
        for imported_module in metadata["imports"]:
            await self._load_module(imported_module)

        # Register providers
        for provider in metadata["providers"]:
            if isinstance(provider, dict):
                # Custom provider
                self.container.register(**provider)
            elif is_injectable(provider):
                # Injectable class
                injectable_meta = get_injectable_metadata(provider)
                self.container.register_class(provider, scope=injectable_meta["scope"])
            else:
                # Default: singleton
                self.container.register_class(provider)

        # Register controllers
        for controller_cls in metadata["controllers"]:
            await self._register_controller(controller_cls)

        # Register WebSocket gateways
        for controller_cls in metadata["controllers"]:
            if is_websocket_gateway(controller_cls):
                await self._register_websocket_gateway(controller_cls)

        # Register event listeners
        await self._register_event_listeners(metadata["providers"])

    async def _register_controller(self, controller_cls: Type):
        """Register a controller with all its routes."""
        if not is_controller(controller_cls):
            return

        # Register controller in DI container
        self.container.register_class(controller_cls)

        # Get controller metadata
        controller_meta = get_controller_metadata(controller_cls)
        base_path = controller_meta["prefix"]
        controller_tags = controller_meta["tags"]

        # Get all routes
        routes = get_routes(controller_cls)

        for route_meta in routes:
            await self._register_route(
                controller_cls,
                route_meta,
                base_path,
                controller_tags,
            )

    async def _register_route(
        self,
        controller_cls: Type,
        route_meta: dict,
        base_path: str,
        controller_tags: List[str],
    ):
        """Register a single route."""
        method = route_meta["method"].lower()
        path = base_path + route_meta["path"]
        handler_func = route_meta["function"]
        tags = controller_tags + route_meta["tags"]

        # Get guards, interceptors, and filters
        guards = get_guards(controller_cls) + get_guards(handler_func)
        interceptors = get_interceptors(controller_cls) + get_interceptors(handler_func)
        filters = get_exception_filters(controller_cls) + get_exception_filters(handler_func)

        # Create route handler with DI, guards, interceptors
        async def route_handler(request: Request):
            try:
                # Get controller instance from DI container
                controller_instance = await self.container.resolve(controller_cls)

                # Execute guards
                for guard_cls in guards:
                    guard = guard_cls() if inspect.isclass(guard_cls) else guard_cls
                    context = GuardContext(request, handler_func)

                    if not await guard.can_activate(context):
                        raise UnauthorizedException("Access denied")

                # Get method
                method_to_call = getattr(controller_instance, handler_func.__name__)

                # Build call chain with interceptors
                async def execute_handler():
                    # Get function parameters from request
                    kwargs = {}

                    # Simple parameter injection (can be enhanced)
                    sig = inspect.signature(handler_func)
                    for param_name, param in sig.parameters.items():
                        if param_name == "self":
                            continue

                        # Try to get from path params
                        if param_name in request.path_params:
                            kwargs[param_name] = request.path_params[param_name]
                        # Try to get from query params
                        elif param_name in request.query_params:
                            kwargs[param_name] = request.query_params[param_name]

                    # Call the actual handler
                    return await method_to_call(**kwargs)

                # Apply interceptors in reverse order
                handler_chain = execute_handler
                for interceptor_cls in reversed(interceptors):
                    interceptor = (
                        interceptor_cls()
                        if inspect.isclass(interceptor_cls)
                        else interceptor_cls
                    )
                    context = InterceptorContext(request, handler_func)

                    # Wrap in closure to capture interceptor
                    async def make_chain(
                        inter: Interceptor, next_h: Callable, ctx: InterceptorContext
                    ):
                        async def chain():
                            return await inter.intercept(ctx, next_h)

                        return chain

                    handler_chain = await make_chain(interceptor, handler_chain, context)

                # Execute the chain
                result = await handler_chain()

                return result

            except Exception as e:
                # Handle with exception filters
                for filter_cls in filters:
                    caught_exceptions = get_caught_exceptions(filter_cls)

                    if any(isinstance(e, exc) for exc in caught_exceptions):
                        filter_instance = (
                            filter_cls() if inspect.isclass(filter_cls) else filter_cls
                        )
                        return await filter_instance.catch(e, request)

                # Re-raise if no filter handled it
                raise

        # Register with FastAPI
        route_func = getattr(self.app, method)
        route_func(
            path,
            status_code=route_meta["status_code"],
            response_model=route_meta["response_model"],
            summary=route_meta["summary"],
            description=route_meta["description"],
            tags=tags,
            **route_meta["extra"],
        )(route_handler)

    async def _register_websocket_gateway(self, gateway_cls: Type):
        """Register a WebSocket gateway."""
        ws_meta = get_websocket_metadata(gateway_cls)
        path = ws_meta["path"]

        # Register in DI
        self.container.register_class(gateway_cls)

        # Get message handlers
        handlers = get_message_handlers(gateway_cls)

        @self.app.websocket(path)
        async def websocket_endpoint(websocket: WebSocket):
            # Get gateway instance
            gateway = await self.container.resolve(gateway_cls)

            # Connect
            if hasattr(gateway, "manager"):
                await gateway.manager.connect(websocket)

            try:
                while True:
                    # Receive message
                    data = await websocket.receive_json()

                    # Get event type
                    event = data.get("event")

                    if event and event in handlers:
                        handler = getattr(gateway, handlers[event].__name__)
                        await handler(data.get("data"), websocket)

            except Exception as e:
                print(f"WebSocket error: {e}")
            finally:
                if hasattr(gateway, "manager"):
                    gateway.manager.disconnect(websocket)

    async def _register_event_listeners(self, providers: List[Type]):
        """Register event listeners from providers."""
        emitter = get_event_emitter()

        for provider_cls in providers:
            # Get instance
            if is_injectable(provider_cls):
                instance = await self.container.resolve(provider_cls)

                # Find event listener methods
                for attr_name in dir(instance):
                    if attr_name.startswith("_"):
                        continue

                    attr = getattr(instance, attr_name)
                    listeners = get_event_listeners(attr)

                    for listener_meta in listeners:
                        event_name = listener_meta["event"]
                        priority = listener_meta["priority"]

                        # Register with event emitter
                        emitter.on(event_name, attr, priority)

    def _setup_global_exception_handlers(self):
        """Setup global exception handlers."""

        @self.app.exception_handler(HttpException)
        async def http_exception_handler(request: Request, exc: HttpException):
            return JSONResponse(
                status_code=exc.status_code,
                content=exc.detail,
            )

        @self.app.exception_handler(Exception)
        async def general_exception_handler(request: Request, exc: Exception):
            print(f"Unhandled exception: {type(exc).__name__}: {str(exc)}")
            return JSONResponse(
                status_code=500,
                content={
                    "message": "Internal server error",
                    "error": "InternalServerError",
                    "statusCode": 500,
                },
            )

    def listen(self, port: int = 3000, host: str = "0.0.0.0", **kwargs):
        """
        Start the application.

        Args:
            port: Port to listen on
            host: Host to bind to
            **kwargs: Additional uvicorn arguments
        """
        import uvicorn

        print(f"🚀 BASW application starting on http://{host}:{port}")
        print(f"📚 Docs available at http://{host}:{port}/docs")

        uvicorn.run(self.app, host=host, port=port, **kwargs)

    def get_app(self) -> FastAPI:
        """Get the underlying FastAPI app."""
        return self.app
