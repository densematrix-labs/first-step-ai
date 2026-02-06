import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .api.v1 import next_step
from .metrics import (
    metrics_router, 
    http_requests_total, 
    http_request_duration_seconds,
    crawler_visits_total,
    TOOL_NAME
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Just tell me the next step. AI that cuts through overwhelm.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bot detection patterns
BOT_PATTERNS = ["Googlebot", "bingbot", "Baiduspider", "YandexBot", "DuckDuckBot", "Slurp", "facebookexternalhit"]


@app.middleware("http")
async def track_requests(request: Request, call_next):
    """Track HTTP requests and detect crawlers."""
    start_time = time.time()
    
    # Detect crawlers
    user_agent = request.headers.get("user-agent", "")
    for bot in BOT_PATTERNS:
        if bot.lower() in user_agent.lower():
            crawler_visits_total.labels(tool=TOOL_NAME, bot=bot).inc()
            break
    
    # Process request
    response = await call_next(request)
    
    # Track metrics
    duration = time.time() - start_time
    endpoint = request.url.path
    method = request.method
    status = response.status_code
    
    http_requests_total.labels(
        tool=TOOL_NAME, 
        endpoint=endpoint, 
        method=method, 
        status=status
    ).inc()
    
    http_request_duration_seconds.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=method
    ).observe(duration)
    
    return response


# Database initialization
from .database import init_db
from .api.v1 import payment

@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    await init_db()

# Routes
app.include_router(metrics_router)
app.include_router(next_step.router, prefix="/api/v1", tags=["Next Step"])
app.include_router(payment.router, prefix="/api/v1", tags=["Payment"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.APP_NAME,
        "description": "Just tell me the next step. AI that cuts through overwhelm.",
        "docs": "/docs"
    }
