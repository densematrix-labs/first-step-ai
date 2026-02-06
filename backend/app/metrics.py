import os
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter
from fastapi.responses import Response

TOOL_NAME = os.getenv("TOOL_NAME", "first-step-ai")

# HTTP Metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["tool", "endpoint", "method", "status"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["tool", "endpoint", "method"]
)

# Business Metrics
next_step_requests_total = Counter(
    "next_step_requests_total",
    "Total next step generation requests",
    ["tool", "language"]
)

next_step_success_total = Counter(
    "next_step_success_total",
    "Successful next step generations",
    ["tool", "language"]
)

next_step_errors_total = Counter(
    "next_step_errors_total",
    "Failed next step generations",
    ["tool", "error_type"]
)

# Token Metrics (for payment integration)
tokens_consumed_total = Counter(
    "tokens_consumed_total",
    "Total tokens consumed",
    ["tool"]
)

free_trial_used_total = Counter(
    "free_trial_used_total",
    "Free trials used",
    ["tool"]
)

# Page View Metrics
page_views_total = Counter(
    "page_views_total",
    "Page views",
    ["tool", "page"]
)

# Crawler Metrics
crawler_visits_total = Counter(
    "crawler_visits_total",
    "Search engine crawler visits",
    ["tool", "bot"]
)

# Router
metrics_router = APIRouter()


@metrics_router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
