"""
Path Validator - Computes metrics and validates paths
"""

from typing import Dict, List, Optional
from app.config.node_types import PRIMARY_GOALS

def compute_path_metrics(
    path: List[str],
    risk_map: Dict[str, float],
    occupancy_map: Dict[str, int],
    graph
) -> Optional[Dict]:
    """Compute performance metrics for a found path."""
    if not path or len(path) < 2:
        return None
    
    total_risk = 0.0
    max_occupancy = 0
    adjacency = graph.get_adjacency_list()
    
    for i in range(len(path) - 1):
        node_u, node_v = path[i], path[i + 1]
        segment_risk = (risk_map.get(node_u, 0) + risk_map.get(node_v, 0)) / 2
        total_risk += segment_risk
        max_occupancy = max(max_occupancy, occupancy_map.get(node_u, 0))
    
    return {
        'total_risk': round(total_risk, 2),
        'max_occupancy': max_occupancy,
        'path_length': len(path)
    }


def validate_path(path: Optional[List[str]], goal_type: str, available_goals: set = None) -> dict:
    """
    Validate a path based on destination quality.
    
    Rules:
    - If primary goals are available, ONLY accept paths ending in primary goals
    - If NO primary goals available, accept secondary goals as shelter routes
    """
    if not path:
        return {"valid": False, "reason": "No path found"}
    
    primary_available = False
    if available_goals:
        primary_available = any(g in PRIMARY_GOALS for g in available_goals)
    
    if goal_type == "primary":
        return {"valid": True, "reason": "Evacuation route to primary goal"}
    elif goal_type == "secondary":
        if primary_available:
            return {"valid": False, "reason": "Primary goals available, rejecting secondary goal path"}
        else:
            return {"valid": True, "reason": "Shelter route (no primary goals safe)"}
    
    return {"valid": False, "reason": "Unknown goal type"}