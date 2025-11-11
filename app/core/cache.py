"""
Caching utilities using Redis.
Provides a simple interface for caching operations.
"""

from typing import Optional, Any
import json
import logging
from functools import wraps
import hashlib

try:
    import redis
    from redis import Redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    Redis = None

from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheClient:
    """
    Cache client wrapper for Redis operations.
    Falls back to no-op if Redis is not available.
    """

    def __init__(self):
        self._client: Optional[Redis] = None
        self._enabled = settings.CACHE_ENABLED and REDIS_AVAILABLE

        if self._enabled:
            try:
                self._client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                )
                # Test connection
                self._client.ping()
                logger.info("Redis cache client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
                self._enabled = False
                self._client = None
        else:
            if not REDIS_AVAILABLE:
                logger.warning("Redis library not installed. Caching disabled.")
            else:
                logger.info("Caching disabled by configuration")

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self._enabled or not self._client:
            return None

        try:
            value = self._client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Cache get error: {e}")

        return None

    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache with optional TTL."""
        if not self._enabled or not self._client:
            return False

        try:
            ttl = ttl or settings.CACHE_TTL
            serialized = json.dumps(value)
            self._client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self._enabled or not self._client:
            return False

        try:
            self._client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern."""
        if not self._enabled or not self._client:
            return 0

        try:
            keys = self._client.keys(pattern)
            if keys:
                return self._client.delete(*keys)
        except Exception as e:
            logger.error(f"Cache delete pattern error: {e}")

        return 0

    def clear(self) -> bool:
        """Clear all cache."""
        if not self._enabled or not self._client:
            return False

        try:
            self._client.flushdb()
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False

    def ping(self) -> bool:
        """Check if Redis is available."""
        if not self._enabled or not self._client:
            return False

        try:
            return self._client.ping()
        except Exception:
            return False


# Global cache client instance
cache_client = CacheClient()


def get_cache() -> CacheClient:
    """Get cache client instance (for dependency injection)."""
    return cache_client


def cache_key(*args, **kwargs) -> str:
    """
    Generate a cache key from arguments.

    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments

    Returns:
        Cache key string
    """
    key_parts = [str(arg) for arg in args]
    key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
    key_string = ":".join(key_parts)

    # Hash long keys
    if len(key_string) > 200:
        return hashlib.md5(key_string.encode()).hexdigest()

    return key_string


def cached(
    ttl: Optional[int] = None,
    key_prefix: str = "",
    key_builder: Optional[callable] = None
):
    """
    Decorator to cache function results.

    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
        key_builder: Custom function to build cache key

    Example:
        @cached(ttl=300, key_prefix="user")
        async def get_user(user_id: int):
            return await db.query(User).filter(User.id == user_id).first()
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                key = key_builder(*args, **kwargs)
            else:
                key = cache_key(func.__name__, *args, **kwargs)

            if key_prefix:
                key = f"{key_prefix}:{key}"

            # Try to get from cache
            cached_value = cache_client.get(key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {key}")
                return cached_value

            # Call function
            result = await func(*args, **kwargs)

            # Cache result
            cache_client.set(key, result, ttl)
            logger.debug(f"Cache set: {key}")

            return result

        return wrapper
    return decorator
