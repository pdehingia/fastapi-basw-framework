"""
Caching System - High-performance caching with decorators.

Better than NestJS:
- Multiple backends (Redis, in-memory)
- TTL support
- Cache invalidation patterns
- Automatic cache key generation
- Type-safe
"""

from typing import Callable, Optional, Any, Dict
from functools import wraps
import asyncio
import hashlib
import json
import time


CACHE_METADATA = "__cache__"


class CacheBackend:
    """Base class for cache backends."""

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        raise NotImplementedError

    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache."""
        raise NotImplementedError

    async def delete(self, key: str):
        """Delete value from cache."""
        raise NotImplementedError

    async def clear(self, pattern: Optional[str] = None):
        """Clear cache."""
        raise NotImplementedError


class InMemoryCache(CacheBackend):
    """
    In-memory cache backend.

    Fast but not distributed. Good for development and single-instance apps.
    """

    def __init__(self):
        self._cache: Dict[str, tuple[Any, Optional[float]]] = {}

    async def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            value, expires_at = self._cache[key]

            # Check expiration
            if expires_at is None or time.time() < expires_at:
                return value

            # Expired, delete
            del self._cache[key]

        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        expires_at = None
        if ttl:
            expires_at = time.time() + ttl

        self._cache[key] = (value, expires_at)

    async def delete(self, key: str):
        if key in self._cache:
            del self._cache[key]

    async def clear(self, pattern: Optional[str] = None):
        if pattern:
            # Simple pattern matching
            keys_to_delete = [
                k for k in self._cache.keys()
                if pattern in k
            ]
            for key in keys_to_delete:
                del self._cache[key]
        else:
            self._cache.clear()


class RedisCache(CacheBackend):
    """
    Redis cache backend.

    Distributed and persistent. Best for production.
    """

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self._client = None

    async def _get_client(self):
        """Lazy initialization of Redis client."""
        if self._client is None:
            import redis.asyncio as aioredis
            self._client = await aioredis.from_url(self.redis_url)
        return self._client

    async def get(self, key: str) -> Optional[Any]:
        client = await self._get_client()
        value = await client.get(key)

        if value:
            return json.loads(value)

        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        client = await self._get_client()
        serialized = json.dumps(value)

        if ttl:
            await client.setex(key, ttl, serialized)
        else:
            await client.set(key, serialized)

    async def delete(self, key: str):
        client = await self._get_client()
        await client.delete(key)

    async def clear(self, pattern: Optional[str] = None):
        client = await self._get_client()

        if pattern:
            keys = await client.keys(f"*{pattern}*")
            if keys:
                await client.delete(*keys)
        else:
            await client.flushdb()


# Global cache instance
_global_cache: CacheBackend = InMemoryCache()


def set_cache_backend(backend: CacheBackend):
    """Set the global cache backend."""
    global _global_cache
    _global_cache = backend


def get_cache_backend() -> CacheBackend:
    """Get the global cache backend."""
    return _global_cache


def _generate_cache_key(func_name: str, args: tuple, kwargs: dict) -> str:
    """Generate a cache key from function arguments."""
    # Create a deterministic string representation
    key_parts = [func_name]

    for arg in args:
        if hasattr(arg, "__dict__"):
            # Skip 'self' and class instances
            continue
        key_parts.append(str(arg))

    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}={v}")

    key_string = ":".join(key_parts)

    # Hash for consistent length
    return hashlib.md5(key_string.encode()).hexdigest()


def Cacheable(
    ttl: Optional[int] = None,
    key_prefix: Optional[str] = None,
):
    """
    Cache the result of a function.

    Args:
        ttl: Time to live in seconds
        key_prefix: Custom prefix for cache key

    Example:
        @Cacheable(ttl=300)
        async def get_user(user_id: int):
            # Expensive database query
            return await db.users.find_one({"id": user_id})
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or func.__name__
            cache_key = f"{prefix}:{_generate_cache_key(func.__name__, args, kwargs)}"

            # Try to get from cache
            cache = get_cache_backend()
            cached_value = await cache.get(cache_key)

            if cached_value is not None:
                return cached_value

            # Execute function
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)

            # Store in cache
            await cache.set(cache_key, result, ttl)

            return result

        setattr(wrapper, CACHE_METADATA, {
            "ttl": ttl,
            "key_prefix": key_prefix,
        })

        return wrapper

    return decorator


def CacheEvict(
    key_prefix: Optional[str] = None,
    all_entries: bool = False,
):
    """
    Evict cache entries after function execution.

    Args:
        key_prefix: Prefix of keys to evict
        all_entries: If True, evict all matching keys

    Example:
        @CacheEvict(key_prefix="users", all_entries=True)
        async def update_user(user_id: int, data: dict):
            # Update user in database
            await db.users.update_one({"id": user_id}, {"$set": data})
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Execute function first
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)

            # Evict cache
            cache = get_cache_backend()

            if all_entries and key_prefix:
                await cache.clear(pattern=key_prefix)
            elif key_prefix:
                prefix = key_prefix
                cache_key = f"{prefix}:{_generate_cache_key(func.__name__, args, kwargs)}"
                await cache.delete(cache_key)

            return result

        return wrapper

    return decorator
