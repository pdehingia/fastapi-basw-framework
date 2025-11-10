"""
CLI Tool - Scaffolding and project management.

Better than NestJS CLI:
- Fast (Python)
- Rich output (colors, progress bars)
- Type-safe
- Customizable templates
"""

import typer
from rich.console import Console
from rich.table import Table
from pathlib import Path
import shutil

app = typer.Typer(
    name="basw",
    help="BASW Framework CLI - Fast scaffolding for FastAPI applications",
)

console = Console()


@app.command()
def new(
    name: str = typer.Argument(..., help="Project name"),
    directory: str = typer.Option(".", help="Directory to create project in"),
):
    """
    Create a new BASW project.

    Example:
        basw new my-api
    """
    console.print(f"[bold green]Creating new BASW project:[/bold green] {name}")

    project_path = Path(directory) / name
    project_path.mkdir(parents=True, exist_ok=True)

    # Create directory structure
    dirs = [
        "src",
        "src/controllers",
        "src/services",
        "src/modules",
        "tests",
    ]

    for dir_name in dirs:
        (project_path / dir_name).mkdir(parents=True, exist_ok=True)

    # Create files
    _create_main_file(project_path, name)
    _create_app_module(project_path, name)
    _create_example_controller(project_path)
    _create_example_service(project_path)
    _create_gitignore(project_path)
    _create_env_file(project_path)
    _create_requirements(project_path)
    _create_readme(project_path, name)

    console.print(f"\n[bold green]✓[/bold green] Project created successfully!")
    console.print(f"\nNext steps:")
    console.print(f"  cd {name}")
    console.print(f"  pip install -r requirements.txt")
    console.print(f"  basw run")


@app.command()
def generate(
    schematic: str = typer.Argument(..., help="Schematic to generate (controller, service, module)"),
    name: str = typer.Argument(..., help="Name of the component"),
):
    """
    Generate a new component.

    Examples:
        basw generate controller users
        basw generate service auth
        basw generate module database
    """
    if schematic == "controller":
        _generate_controller(name)
    elif schematic == "service":
        _generate_service(name)
    elif schematic == "module":
        _generate_module(name)
    else:
        console.print(f"[bold red]Unknown schematic:[/bold red] {schematic}")
        console.print("Available schematics: controller, service, module")


@app.command()
def run(
    port: int = typer.Option(3000, help="Port to run on"),
    host: str = typer.Option("0.0.0.0", help="Host to bind to"),
    reload: bool = typer.Option(True, help="Enable auto-reload"),
):
    """
    Run the application in development mode.
    """
    import uvicorn

    console.print(f"[bold green]Starting BASW application...[/bold green]")
    console.print(f"Listening on http://{host}:{port}")

    uvicorn.run(
        "src.main:app",
        host=host,
        port=port,
        reload=reload,
    )


@app.command()
def info():
    """Display BASW framework information."""
    from basw import __version__

    table = Table(title="BASW Framework")
    table.add_column("Property", style="cyan")
    table.add_column("Value", style="green")

    table.add_row("Version", __version__)
    table.add_row("Python Framework", "FastAPI")
    table.add_row("Inspired By", "NestJS")

    console.print(table)


# Helper functions


def _create_main_file(project_path: Path, name: str):
    """Create main.py file."""
    content = f'''"""
{name} - BASW Application Entry Point
"""

from basw import Application
from src.app_module import AppModule


async def create_app():
    """Create and configure the application."""
    app = await Application.create(
        AppModule,
        title="{name}",
        description="Built with BASW Framework",
        version="1.0.0",
    )
    return app


# For uvicorn
app = None


async def startup():
    global app
    basw_app = await create_app()
    app = basw_app.get_app()


# Import at module level for uvicorn
import asyncio
asyncio.run(startup())


if __name__ == "__main__":
    import asyncio

    async def main():
        basw_app = await create_app()
        basw_app.listen(3000)

    asyncio.run(main())
'''
    (project_path / "src" / "main.py").write_text(content)


def _create_app_module(project_path: Path, name: str):
    """Create app module."""
    content = '''"""
Application Root Module
"""

from basw import Module
from src.controllers.app_controller import AppController
from src.services.app_service import AppService


@Module(
    controllers=[AppController],
    providers=[AppService],
)
class AppModule:
    """Root application module."""
    pass
'''
    (project_path / "src" / "app_module.py").write_text(content)


def _create_example_controller(project_path: Path):
    """Create example controller."""
    content = '''"""
Example Controller
"""

from basw import Controller, Get, Injectable
from src.services.app_service import AppService


@Controller("/")
class AppController:
    """Main application controller."""

    def __init__(self, app_service: AppService):
        self.app_service = app_service

    @Get()
    async def root(self):
        """Get application info."""
        return self.app_service.get_info()

    @Get("/health")
    async def health(self):
        """Health check endpoint."""
        return {"status": "ok"}
'''
    (project_path / "src" / "controllers" / "app_controller.py").write_text(content)
    (project_path / "src" / "controllers" / "__init__.py").write_text("")


def _create_example_service(project_path: Path):
    """Create example service."""
    content = '''"""
Example Service
"""

from basw import Injectable


@Injectable()
class AppService:
    """Main application service."""

    def get_info(self):
        """Get application information."""
        return {
            "name": "BASW Application",
            "version": "1.0.0",
            "framework": "BASW",
        }
'''
    (project_path / "src" / "services" / "app_service.py").write_text(content)
    (project_path / "src" / "services" / "__init__.py").write_text("")


def _create_gitignore(project_path: Path):
    """Create .gitignore file."""
    content = '''__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv
.env
.env.local
*.log
.pytest_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
.DS_Store
'''
    (project_path / ".gitignore").write_text(content)


def _create_env_file(project_path: Path):
    """Create .env.example file."""
    content = '''# Application
APP_NAME=BASW Application
ENVIRONMENT=development
DEBUG=true

# Server
HOST=0.0.0.0
PORT=3000

# Database (optional)
# DATABASE_URL=postgresql://user:pass@localhost/db

# Redis (optional)
# REDIS_URL=redis://localhost:6379

# JWT (optional)
# JWT_SECRET=your-secret-key
'''
    (project_path / ".env.example").write_text(content)


def _create_requirements(project_path: Path):
    """Create requirements.txt."""
    content = '''fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-multipart>=0.0.6
basw>=0.1.0

# Development
pytest>=7.4.0
pytest-asyncio>=0.21.0
black>=23.0.0
ruff>=0.1.0
'''
    (project_path / "requirements.txt").write_text(content)


def _create_readme(project_path: Path, name: str):
    """Create README.md."""
    content = f'''# {name}

Built with [BASW Framework](https://github.com/yourusername/basw-framework) - A powerful FastAPI framework inspired by NestJS.

## Getting Started

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the application:
```bash
basw run
```

4. Open your browser to http://localhost:3000/docs

## Project Structure

```
{name}/
├── src/
│   ├── controllers/    # HTTP route handlers
│   ├── services/       # Business logic
│   ├── modules/        # Feature modules
│   ├── app_module.py   # Root module
│   └── main.py         # Application entry point
├── tests/              # Test files
├── .env                # Environment variables
└── requirements.txt    # Python dependencies
```

## Available Commands

- `basw run` - Run development server
- `basw generate controller <name>` - Generate a new controller
- `basw generate service <name>` - Generate a new service
- `basw generate module <name>` - Generate a new module

## Learn More

- [BASW Documentation](https://github.com/yourusername/basw-framework)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
'''
    (project_path / "README.md").write_text(content)


def _generate_controller(name: str):
    """Generate a new controller."""
    console.print(f"[bold green]Generating controller:[/bold green] {name}")

    # TODO: Implement controller generation
    console.print("[yellow]Not implemented yet[/yellow]")


def _generate_service(name: str):
    """Generate a new service."""
    console.print(f"[bold green]Generating service:[/bold green] {name}")

    # TODO: Implement service generation
    console.print("[yellow]Not implemented yet[/yellow]")


def _generate_module(name: str):
    """Generate a new module."""
    console.print(f"[bold green]Generating module:[/bold green] {name}")

    # TODO: Implement module generation
    console.print("[yellow]Not implemented yet[/yellow]")


if __name__ == "__main__":
    app()
