"""
rate_limit.py
-------------
SlowAPI rate limiter configuration.

Limits are defined in config.py as strings like "5/minute".
Each endpoint applies its own limit using the @limiter.limit() decorator.
The key_func defaults to client IP address (standard for session creation).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance — imported into endpoint modules that need it
limiter = Limiter(key_func=get_remote_address)
