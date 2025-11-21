#!/usr/bin/env python3
"""
Minimal admin user creation script
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.core.config import settings

async def create_admin_user():
    """Create admin user directly"""
    # Create async engine
    engine = create_async_engine(settings.database_url_async)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            # Check if admin user already exists
            result = await session.execute(
                text("SELECT id FROM admin_users WHERE email = :email"),
                {"email": "admin@maya.com"}
            )
            existing = result.fetchone()

            if existing:
                print("✅ Admin user already exists")
                return

            # Hash password
            password = "admin123"
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Create admin user
            await session.execute(
                text("""
                    INSERT INTO admin_users (
                        id, email, username, full_name, hashed_password,
                        is_active, is_verified, email_verified_at, is_superuser,
                        created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), :email, :username, :full_name, :hashed_password,
                        :is_active, :is_verified, NOW(), :is_superuser,
                        NOW(), NOW()
                    )
                """),
                {
                    "email": "admin@maya.com",
                    "username": "superadmin",
                    "full_name": "Super Administrator",
                    "hashed_password": hashed_password,
                    "is_active": True,
                    "is_verified": True,
                    "is_superuser": True
                }
            )

            await session.commit()
            print("✅ Admin user created successfully")
            print("   Email: admin@maya.com")
            print("   Password: admin123")

        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(create_admin_user())