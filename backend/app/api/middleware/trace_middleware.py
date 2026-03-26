"""
trace_middleware.py
-------------------
Injects a unique X-Trace-ID on every request so that all log lines
for a single request can be correlated in structured logs.
Also emits a structured JSON log line per request: method, path,
status, duration, trace_id.
"""
import time
import uuid
import logging
import json
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("smart_mental.access")


class TraceIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        trace_id = str(uuid.uuid4())
        request.state.trace_id = trace_id

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        response.headers["X-Trace-ID"] = trace_id

        log_record = {
            "trace_id": trace_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
        }
        logger.info(json.dumps(log_record))

        return response
