"""
MongoDB connection and configuration.
Supports async operations with Motor.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB client wrapper with both sync and async support."""
    
    def __init__(self):
        self._async_client: AsyncIOMotorClient = None
        self._sync_client: MongoClient = None
        self._async_database = None
        self._sync_database = None

    async def connect_async(self):
        """Create async MongoDB connection."""
        if not self._async_client:
            self._async_client = AsyncIOMotorClient(settings.MONGODB_URL)
            self._async_database = self._async_client[settings.MONGODB_DB_NAME]
            logger.info(f"Connected to MongoDB (async): {settings.MONGODB_DB_NAME}")

    def connect_sync(self):
        """Create sync MongoDB connection."""
        if not self._sync_client:
            self._sync_client = MongoClient(settings.MONGODB_URL)
            self._sync_database = self._sync_client[settings.MONGODB_DB_NAME]
            logger.info(f"Connected to MongoDB (sync): {settings.MONGODB_DB_NAME}")

    async def disconnect_async(self):
        """Close async MongoDB connection."""
        if self._async_client:
            self._async_client.close()
            self._async_client = None
            self._async_database = None
            logger.info("Disconnected from MongoDB (async)")

    def disconnect_sync(self):
        """Close sync MongoDB connection."""
        if self._sync_client:
            self._sync_client.close()
            self._sync_client = None
            self._sync_database = None
            logger.info("Disconnected from MongoDB (sync)")

    @property
    def async_database(self):
        """Get async database instance."""
        if not self._async_database:
            raise RuntimeError("MongoDB async connection not established. Call connect_async() first.")
        return self._async_database

    @property
    def sync_database(self):
        """Get sync database instance."""
        if not self._sync_database:
            raise RuntimeError("MongoDB sync connection not established. Call connect_sync() first.")
        return self._sync_database

    async def ping_async(self) -> bool:
        """Check async MongoDB connection health."""
        try:
            await self._async_client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"MongoDB async ping failed: {e}")
            return False

    def ping_sync(self) -> bool:
        """Check sync MongoDB connection health."""
        try:
            self._sync_client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"MongoDB sync ping failed: {e}")
            return False

# Global MongoDB instance
mongodb = MongoDB()

async def get_mongo_async_db():
    """Async dependency for FastAPI to get MongoDB database."""
    await mongodb.connect_async()
    return mongodb.async_database

def get_mongo_sync_db():
    """Sync function to get MongoDB database."""
    mongodb.connect_sync()
    return mongodb.sync_database

async def create_mongodb_indexes():
    """Create all MongoDB indexes as per the schema."""
    db = await get_mongo_async_db()
    
    logger.info("Creating MongoDB indexes...")
    
    # Chats collection indexes
    await db.chats.create_index([("pg_id", 1)], unique=True, sparse=True)
    await db.chats.create_index([("participants.user_pg_id", 1)])
    await db.chats.create_index([("last_message.timestamp", -1)])
    
    # Messages collection (time-series) indexes
    await db.messages.create_index([("chat_id", 1), ("created_at", 1)])
    await db.messages.create_index([("sender_user_pg_id", 1), ("created_at", -1)])
    
    # Portfolio images collection indexes
    await db.portfolio_images.create_index([
        ("artist_user_pg_id", 1), 
        ("is_active", 1), 
        ("moderation.status", 1)
    ])
    await db.portfolio_images.create_index([("image_hash", 1)])
    await db.portfolio_images.create_index([("tags", 1)])
    
    # Notifications collection indexes (with TTL)
    await db.notifications.create_index([("user_pg_id", 1), ("created_at", -1)])
    await db.notifications.create_index([("expires_at", 1)], expireAfterSeconds=0)
    
    # Analytics events collection indexes (with TTL)
    await db.analytics_events.create_index([("user_pg_id", 1), ("created_at", -1)])
    await db.analytics_events.create_index([("event_name", 1), ("created_at", -1)])
    await db.analytics_events.create_index([("expires_at", 1)], expireAfterSeconds=0)
    
    # Artist availability collection indexes
    await db.artist_availability.create_index([("artist_user_pg_id", 1)], unique=True)
    
    logger.info("MongoDB indexes created successfully")

async def setup_mongodb_collections():
    """Setup MongoDB collections with time-series configuration."""
    db = await get_mongo_async_db()
    
    logger.info("Setting up MongoDB collections...")
    
    try:
        # Create messages collection as time-series
        await db.create_collection(
            "messages",
            timeseries={
                "timeField": "created_at",
                "metaField": "chat_id",
                "granularity": "minutes"
            }
        )
        logger.info("Created messages time-series collection")
    except Exception as e:
        logger.warning(f"Messages collection might already exist: {e}")
    
    try:
        # Create analytics_events collection as time-series
        await db.create_collection(
            "analytics_events",
            timeseries={
                "timeField": "created_at",
                "metaField": "user_pg_id",
                "granularity": "hours"
            }
        )
        logger.info("Created analytics_events time-series collection")
    except Exception as e:
        logger.warning(f"Analytics events collection might already exist: {e}")
    
    # Create indexes
    await create_mongodb_indexes()
    
    logger.info("MongoDB collections setup completed")