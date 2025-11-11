from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="basw",
    version="0.1.0",
    author="BASW Framework Team",
    description="A comprehensive FastAPI framework inspired by NestJS",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/basw-framework",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "pydantic>=2.0.0",
        "pydantic-settings>=2.0.0",
        "python-multipart>=0.0.6",
        "websockets>=12.0",
        "redis>=5.0.0",
        "typer>=0.9.0",
        "rich>=13.0.0",
        "jinja2>=3.1.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.1.0",
            "black>=23.0.0",
            "ruff>=0.1.0",
            "mypy>=1.5.0",
        ],
        "database": [
            "sqlalchemy>=2.0.0",
            "asyncpg>=0.29.0",
            "alembic>=1.12.0",
        ],
        "graphql": [
            "strawberry-graphql>=0.200.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "basw=basw.cli.main:app",
        ],
    },
)
