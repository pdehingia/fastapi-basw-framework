#!/bin/bash
# Docker startup script for Maya Platform backend
# This script runs inside the Docker container on startup

echo "🚀 Starting Maya Platform Backend..."
echo "================================================"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
while ! pg_isready -h postgres -p 5432 -U ${POSTGRES_USER:-postgres}; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
while ! mongosh --host mongodb:27017 --eval "db.adminCommand('ping')" --quiet; do
    echo "MongoDB is unavailable - sleeping"
    sleep 2
done
echo "✅ MongoDB is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
REDIS_PASSWORD=${REDIS_PASSWORD:-""}
if [ -n "$REDIS_PASSWORD" ]; then
    while ! redis-cli -h redis -p 6379 -a "$REDIS_PASSWORD" ping; do
        echo "Redis is unavailable - sleeping"
        sleep 2
    done
else
    while ! redis-cli -h redis -p 6379 ping; do
        echo "Redis is unavailable - sleeping"
        sleep 2
    done
fi
echo "✅ Redis is ready!"

echo "💾 Running database migrations..."

# Run Alembic migrations
echo "📊 Running PostgreSQL migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL migrations completed successfully!"
else
    echo "❌ PostgreSQL migrations failed!"
    exit 1
fi

# Setup MongoDB collections and indexes
echo "🍃 Setting up MongoDB collections..."
python -c "
import asyncio
from app.core.mongodb import get_mongodb_client, setup_mongodb

async def setup():
    try:
        client = await get_mongodb_client()
        await setup_mongodb()
        print('✅ MongoDB setup completed successfully!')
        client.close()
    except Exception as e:
        print(f'❌ MongoDB setup failed: {e}')
        exit(1)

asyncio.run(setup())
"

if [ $? -eq 0 ]; then
    echo "✅ MongoDB collections setup completed!"
else
    echo "❌ MongoDB setup failed!"
    exit 1
fi

# Seed initial data
echo "🌱 Seeding initial data..."
python -c "
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, '/app')

# Import the seeding function
from scripts.setup_databases import seed_initial_data

async def seed():
    try:
        await seed_initial_data()
        print('✅ Initial data seeding completed!')
    except Exception as e:
        print(f'❌ Data seeding failed: {e}')
        # Don't exit here, as the app can run without initial data

asyncio.run(seed())
"

echo "🎉 Maya Platform initialization completed!"
echo "================================================"
echo "Starting FastAPI application..."

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1