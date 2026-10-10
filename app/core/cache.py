import json
import hashlib
import time
from functools import wraps
from typing import Any, Callable, Dict, Tuple, Optional
import redis.asyncio as redis
from loguru import logger
from fastapi import Request

# In production, this goes to settings
REDIS_URL = "redis://localhost:6379"

# In-memory fallback cache: key -> (timestamp, expire_seconds, cached_data)
_memory_cache: Dict[str, Tuple[float, int, Any]] = {}
_redis_available: Optional[bool] = None
redis_client: Optional[redis.Redis] = None


async def _get_redis() -> Optional[redis.Redis]:
    global _redis_available, redis_client
    if _redis_available is False:
        return None
    if redis_client is None:
        try:
            client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, socket_connect_timeout=0.3)
            await client.ping()
            redis_client = client
            _redis_available = True
            logger.info("Connected to Redis cache on localhost:6379")
        except Exception:
            _redis_available = False
            logger.info("Redis not active on localhost:6379. Fast in-memory cache enabled.")
            return None
    return redis_client


def cache_response(expire: int = 300):
    """
    Decorator to cache FastAPI endpoint responses in Redis with automatic memory fallback.
    Uses request URL and query params as the cache key.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find Request object in kwargs
            request: Optional[Request] = kwargs.get("request")
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            import asyncio
            if not request:
                if asyncio.iscoroutinefunction(func):
                    return await func(*args, **kwargs)
                return await asyncio.to_thread(func, *args, **kwargs)

            # Generate cache key based on URL and query params
            raw_key = f"{request.url.path}?{request.url.query}"
            cache_key = f"cache:{hashlib.md5(raw_key.encode()).hexdigest()}"

            # 1. Check in-memory cache first (0ms)
            now = time.time()
            if cache_key in _memory_cache:
                cached_time, ttl, val = _memory_cache[cache_key]
                if (now - cached_time) < ttl:
                    return val
                else:
                    _memory_cache.pop(cache_key, None)

            # 2. Check Redis if available
            r_client = await _get_redis()
            if r_client:
                try:
                    cached = await r_client.get(cache_key)
                    if cached:
                        parsed = json.loads(cached)
                        _memory_cache[cache_key] = (now, expire, parsed)
                        return parsed
                except Exception:
                    pass

            # 3. Compute response
            if asyncio.iscoroutinefunction(func):
                response = await func(*args, **kwargs)
            else:
                response = await asyncio.to_thread(func, *args, **kwargs)

            # 4. Save to in-memory cache and Redis
            try:
                if hasattr(response, "model_dump"):
                    data = response.model_dump()
                elif hasattr(response, "dict"):
                    data = response.dict()
                elif isinstance(response, list) and len(response) > 0 and hasattr(response[0], "model_dump"):
                    data = [r.model_dump() for r in response]
                else:
                    data = response
                
                _memory_cache[cache_key] = (now, expire, data)

                if r_client:
                    await r_client.setex(cache_key, expire, json.dumps(data))
            except Exception:
                pass

            return response
        return wrapper
    return decorator
