"""
Source Prioritizer - Orders source nodes by urgency
Only includes sources that are SAFE (not blocked)
"""

import heapq
from typing import Dict, List
from app.config.node_types import SOURCE_NODES
from app.config.constants import (
    PRIORITY_OCCUPANCY_WEIGHT,
    PRIORITY_RISK_WEIGHT,
    MAX_PRACTICAL_RISK
)

def prioritize_sources(risk_map: Dict[str, float], occupancy_map: Dict[str, int]) -> List[str]:
    """
    Prioritize SAFE source nodes based on occupancy and risk.
    
    Only sources with finite risk (not blocked) are included.
    Priority Score = (Occupancy Ratio × 0.7) + (Normalized Risk × 0.3)
    Higher score = higher priority (evacuated first)
    """
    priority_queue = []
    
    for source in SOURCE_NODES:
        # SKIP if source node itself is blocked (risk = infinity)
        if risk_map.get(source, 0) == float('inf'):
            continue
        
        # Normalize occupancy (cap at 1.0)
        occupancy_score = min(occupancy_map.get(source, 5) / 20.0, 1.0)
        
        # Normalize risk (cap at 1.0, 200 is practical maximum)
        risk_score = min(risk_map.get(source, 0) / MAX_PRACTICAL_RISK, 1.0)
        
        # Calculate priority (higher = more urgent)
        priority = (occupancy_score * PRIORITY_OCCUPANCY_WEIGHT) + \
                   (risk_score * PRIORITY_RISK_WEIGHT)
        
        heapq.heappush(priority_queue, (-priority, source))
    
    # Extract in priority order (highest first)
    result = []
    while priority_queue:
        _, source = heapq.heappop(priority_queue)
        result.append(source)
    
    return result