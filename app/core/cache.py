import json
import hashlib
from functools import wraps
from typing import Any, Callable
import redis.asyncio as redis
from loguru import logger
from fastapi import Request

# In production, this goes to settings
REDIS_URL = "redis://localhost:6379"

# Create a global Redis pool
redis_client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)

def cache_response(expire: int = 300):
    """
    Decorator to cache FastAPI endpoint responses in Redis.
    Uses request URL and query params as the cache key.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find Request object in kwargs
            request: Request = kwargs.get("request")
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                logger.warning("Cache decorator used on an endpoint without a Request parameter")
                return await func(*args, **kwargs)

            # Generate cache key based on URL and query params
            raw_key = f"{request.url.path}?{request.url.query}"
            cache_key = f"cache:{hashlib.md5(raw_key.encode()).hexdigest()}"

            try:
                cached = await redis_client.get(cache_key)
                if cached:
                    logger.debug(f"Cache hit for {raw_key}")
                    return json.loads(cached)
            except Exception as e:
                logger.error(f"Redis cache GET error: {e}")

            # If not in cache, compute response
            # Note: For async endpoints, we use await. For sync endpoints, we can't easily await inside wrapper
            # For simplicity in this codebase, we assume func is async or we run it
            import asyncio
            if asyncio.iscoroutinefunction(func):
                response = await func(*args, **kwargs)
            else:
                # Run sync func in thread pool
                response = await asyncio.to_thread(func, *args, **kwargs)

            # Try to store in cache
            try:
                # If response is pydantic model, convert to dict
                if hasattr(response, "model_dump"):
                    data = response.model_dump()
                elif hasattr(response, "dict"):
                    data = response.dict()
                elif isinstance(response, list) and len(response) > 0 and hasattr(response[0], "model_dump"):
                    data = [r.model_dump() for r in response]
                else:
                    data = response
                    
                await redis_client.setex(cache_key, expire, json.dumps(data))
            except Exception as e:
                logger.error(f"Redis cache SET error: {e}")

            return response
        return wrapper
    return decorator
