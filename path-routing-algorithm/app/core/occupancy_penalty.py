"""
Occupancy Penalty Calculator - Discourages routing through crowded areas
As defined in the algorithm documentation (Section 4.2)
"""

from app.config.constants import NODE_CAPACITIES

def calculate_occupancy_penalty(people_count: int, node_type: str = "Room") -> float:
    """
    Calculate penalty based on occupancy density.
    
    Density = people_count / capacity
    
    Returns:
        Penalty value from 0.0 to 1.0 as per documentation:
        - < 0.5 density: 0.0 (Free flow)
        - 0.5-1.5 density: 0.2 (Normal flow)
        - 1.5-3.0 density: 0.5 (Crowded)
        - 3.0-5.0 density: 0.8 (Very crowded)
        - > 5.0 density: 1.0 (Critical)
    """
    capacity = NODE_CAPACITIES.get(node_type, 20)
    
    if capacity <= 0:
        return 1.0
    
    density = people_count / capacity
    
    if density < 0.5:
        return 0.0
    elif density < 1.5:
        return 0.2
    elif density < 3.0:
        return 0.5
    elif density < 5.0:
        return 0.8
    else:
        return 1.0