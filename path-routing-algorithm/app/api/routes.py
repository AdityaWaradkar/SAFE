"""
API Routes
As defined in the algorithm documentation (Section 8.4)
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

# Cache for results
results_cache: Dict[str, Any] = {
    "paths": {},
    "metrics": {},
    "timestamp": None,
    "trigger": None
}


@router.get("/status")
async def get_status():
    """Get system status"""
    return {
        "status": "running",
        "last_update": results_cache.get("timestamp"),
        "active_paths": len([p for p in results_cache.get("paths", {}).values() if p]),
        "version": "1.0.0"
    }


@router.get("/paths")
async def get_paths():
    """Get all evacuation paths (both node and corridor formats)"""
    return {
        "timestamp": results_cache.get("timestamp"),
        "trigger": results_cache.get("trigger"),
        "paths": results_cache.get("paths", {})
    }


@router.get("/paths/nodes")
async def get_node_paths():
    """Get node-based paths only (for debugging)"""
    node_paths = {}
    for source, path_data in results_cache.get("paths", {}).items():
        if path_data and "node_path" in path_data:
            node_paths[source] = path_data["node_path"]
    return {
        "timestamp": results_cache.get("timestamp"),
        "node_paths": node_paths
    }


@router.get("/paths/corridors")
async def get_corridor_paths():
    """Get corridor-based paths only (for navigation systems)"""
    corridor_paths = {}
    for source, path_data in results_cache.get("paths", {}).items():
        if path_data and "corridor_path" in path_data:
            corridor_paths[source] = path_data["corridor_path"]
    return {
        "timestamp": results_cache.get("timestamp"),
        "corridor_paths": corridor_paths
    }


@router.get("/paths/metrics")
async def get_metrics():
    """Get path metrics"""
    return {
        "timestamp": results_cache.get("timestamp"),
        "metrics": results_cache.get("metrics", {})
    }


@router.get("/goals/status")
async def get_goals_status():
    """Get goal node safety status"""
    from app.config.node_types import PRIMARY_GOALS, SECONDARY_GOALS
    
    return {
        "primary_goals": PRIMARY_GOALS,
        "secondary_goals": SECONDARY_GOALS,
        "note": "Full status requires sensor data"
    }


def update_results(paths: dict, metrics: dict, timestamp: float, trigger: str):
    """Internal function to update results cache"""
    global results_cache
    results_cache["paths"] = paths
    results_cache["metrics"] = metrics
    results_cache["timestamp"] = timestamp
    results_cache["trigger"] = trigger