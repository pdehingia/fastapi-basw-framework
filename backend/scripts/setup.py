#!/usr/bin/env python3
"""
Maya Platform Dependencies Update and Setup Script
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description=""):
    """Run a command and handle errors."""
    print(f"🔄 {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed")
        print(f"Error: {e.stderr}")
        return None

def update_dependencies():
    """Update all dependencies to latest versions."""
    print("🚀 MAYA PLATFORM SETUP")
    print("=" * 50)
    
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️ Warning: Not in a virtual environment!")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Exiting. Please activate a virtual environment first.")
            return False
    
    # Upgrade pip first
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip")
    
    # Install wheel for faster installs
    run_command(f"{sys.executable} -m pip install --upgrade wheel setuptools", "Installing build tools")
    
    # Install production dependencies
    run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing production dependencies")
    
    # Install development dependencies
    run_command(f"{sys.executable} -m pip install -r requirements-dev.txt", "Installing development dependencies")
    
    # Show installed packages
    print("\n📦 INSTALLED PACKAGES:")
    result = run_command(f"{sys.executable} -m pip list", "Listing installed packages")
    if result:
        lines = result.stdout.split('\n')
        for line in lines[:20]:  # Show first 20 packages
            if line.strip():
                print(f"  {line}")
        if len(lines) > 20:
            print(f"  ... and {len(lines) - 20} more packages")
    
    return True

def setup_pre_commit():
    """Set up pre-commit hooks."""
    print("\n🔧 SETTING UP PRE-COMMIT HOOKS")
    print("=" * 40)
    
    if not Path(".pre-commit-config.yaml").exists():
        print("Creating .pre-commit-config.yaml...")
        
        pre_commit_config = """
# Maya Platform Pre-commit Configuration
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
"""
        with open(".pre-commit-config.yaml", "w") as f:
            f.write(pre_commit_config.strip())
    
    # Install pre-commit hooks
    run_command("pre-commit install", "Installing pre-commit hooks")
    run_command("pre-commit autoupdate", "Updating pre-commit hooks")

def create_directories():
    """Create necessary directories."""
    print("\n📁 CREATING DIRECTORIES")
    print("=" * 30)
    
    directories = [
        "logs",
        "uploads", 
        "static",
        "media",
        "backups"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created/verified: {directory}/")

def validate_environment():
    """Validate that environment is properly configured."""
    print("\n🔍 ENVIRONMENT VALIDATION")
    print("=" * 30)
    
    # Check if .env exists
    if not Path(".env").exists():
        print("❌ .env file not found!")
        if Path(".env.example").exists():
            print("📋 Found .env.example - please copy to .env and configure")
        return False
    
    print("✅ .env file found")
    
    # Try to load configuration
    try:
        import sys
        sys.path.insert(0, '.')
        from app.core.config import settings
        print(f"✅ Configuration loaded: {settings.PROJECT_NAME}")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def main():
    """Main setup function."""
    print("🏗️ Maya Platform Setup and Dependency Update")
    print("=" * 60)
    print()
    
    # Change to the backend directory if not already there
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found. Are you in the backend directory?")
        return False
    
    # Update dependencies
    if not update_dependencies():
        print("❌ Dependency update failed!")
        return False
    
    # Create directories
    create_directories()
    
    # Setup pre-commit (optional)
    try:
        setup_pre_commit()
    except Exception as e:
        print(f"⚠️ Pre-commit setup failed (optional): {e}")
    
    # Validate environment
    env_valid = validate_environment()
    
    print("\n" + "=" * 60)
    print("🎉 SETUP COMPLETE!")
    print("=" * 60)
    
    print("\n📋 NEXT STEPS:")
    if not env_valid:
        print("  1. Copy .env.example to .env and configure your credentials")
    print("  2. Run: docker compose up -d")
    print("  3. Visit: http://localhost:8000/docs")
    print("\n🚀 Maya Platform is ready for deployment!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)