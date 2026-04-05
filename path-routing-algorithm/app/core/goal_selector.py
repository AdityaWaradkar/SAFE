"""
Dynamic Goal Selector - Chooses available destinations based on safety
As defined in the algorithm documentation (Section 5, Phase 4)
"""

from typing import Set, Dict, Optional
from app.core.risk_calculator import calculate_node_risk
from app.config.node_types import PRIMARY_GOALS, SECONDARY_GOALS

def select_available_goals(
    sensor_data: Dict[str, list],
    occupancy_data: Optional[Dict[str, int]] = None
) -> Set[str]:
    """
    Select available goal nodes based on safety conditions.
    
    Priority (as per documentation):
        1. Primary goals (exits, safe rooms)
        2. Secondary goals (rooms, conference rooms) - fallback when no primary safe
    
    Returns:
        Set of available goal node identifiers
    """
    available = set()
    
    # Stage 1: Check Primary Goals (Exits and Safe Rooms)
    for goal in PRIMARY_GOALS:
        if goal in sensor_data:
            values = sensor_data[goal]
            flame, smoke, temp = values[0], values[1], values[2]
            
            risk = calculate_node_risk(flame, smoke, temp)
            if risk != float('inf'):
                available.add(goal)
    
    # Stage 2: Fallback to Secondary Goals if no primary available
    if not available:
        for goal in SECONDARY_GOALS:
            if goal in sensor_data:
                values = sensor_data[goal]
                flame, smoke, temp = values[0], values[1], values[2]
                
                risk = calculate_node_risk(flame, smoke, temp)
                if risk != float('inf'):
                    available.add(goal)
    
    return available