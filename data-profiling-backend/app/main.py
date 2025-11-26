"""
FastAPI Main Application
Data Profiling Utility Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import connections, profiling, jobs, results

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Data Profiling Utility",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(connections.router, prefix=f"{settings.API_V1_PREFIX}/connections", tags=["connections"])
app.include_router(profiling.router, prefix=f"{settings.API_V1_PREFIX}/profiling", tags=["profiling"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_PREFIX}/jobs", tags=["jobs"])
app.include_router(results.router, prefix=f"{settings.API_V1_PREFIX}/results", tags=["results"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
