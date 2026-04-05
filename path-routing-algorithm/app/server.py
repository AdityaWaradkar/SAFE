"""
FastAPI Server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.utils.logger import get_logger
from app.workers.algorithm_worker import AlgorithmWorker

logger = get_logger(__name__)

app = FastAPI(
    title="Dynamic Risk-Aware Path Routing Algorithm",
    description="Real-time evacuation path routing for building emergencies",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

worker = AlgorithmWorker()

@app.on_event("startup")
async def startup_event():
    logger.info("Path Routing Algorithm Server Started")
    worker.start()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Path Routing Algorithm Server Shutting Down")
    worker.stop()

@app.get("/")
async def root():
    return {
        "service": "Dynamic Risk-Aware Path Routing Algorithm",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}