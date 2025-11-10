# Contributing to BASW Framework

Thank you for your interest in contributing to BASW! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/basw-framework/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Python version and environment details
   - Code samples if applicable

### Suggesting Features

1. Check [Discussions](https://github.com/yourusername/basw-framework/discussions) for similar ideas
2. Create a new discussion or issue with:
   - Clear use case
   - Proposed API/interface
   - Comparison with similar features in other frameworks
   - Why this would benefit BASW users

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes:
   - Follow the code style (Black, Ruff)
   - Add tests for new features
   - Update documentation as needed
   - Keep commits atomic and well-described

4. Run tests and checks:
   ```bash
   pytest
   black .
   ruff check .
   mypy basw
   ```

5. Push to your fork and create a pull request:
   - Clear title and description
   - Reference any related issues
   - Include examples if applicable

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/basw-framework.git
   cd basw-framework
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install development dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

4. Run tests:
   ```bash
   pytest
   ```

## Code Style

- Use [Black](https://black.readthedocs.io/) for formatting (line length: 100)
- Use [Ruff](https://github.com/astral-sh/ruff) for linting
- Use type hints wherever possible
- Write docstrings for all public APIs
- Follow PEP 8 guidelines

## Testing

- Write tests for all new features
- Maintain or improve code coverage
- Use pytest and pytest-asyncio
- Test both success and error cases
- Use descriptive test names

Example:
```python
import pytest
from basw.testing import TestClient

@pytest.mark.asyncio
async def test_user_creation_success():
    # Test successful user creation
    pass

@pytest.mark.asyncio
async def test_user_creation_duplicate_username():
    # Test error handling for duplicate username
    pass
```

## Documentation

- Update README.md for new features
- Add docstrings to all public APIs
- Include code examples in docstrings
- Update example app if relevant

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add GraphQL support
fix: resolve circular dependency in DI container
docs: update WebSocket examples
test: add tests for caching system
refactor: simplify guard implementation
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build/tooling changes

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/yourusername/basw-framework/discussions)
- Ask in an issue
- Reach out to maintainers

Thank you for contributing to BASW! 🚀
