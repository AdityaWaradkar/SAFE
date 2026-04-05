"""
Risk Calculator - Computes node risk from sensor values
As defined in the algorithm documentation (Section 4.1)
"""

from app.config.thresholds import *

def calculate_node_risk(flame: float, smoke: float, temp: float) -> float:
    """
    Calculate continuous risk value for a node.
    
    Returns:
        float('inf') if node is blocked (hazard exceeds threshold)
        Otherwise risk value (0 to ~200) based on weighted sum
    
    As per documentation:
    - Flame > 40%: Blocked
    - Smoke > 60%: Blocked
    - Temp > 60°C: Blocked
    """
    # Hard block checks
    if flame > FLAME_BLOCK_THRESHOLD:
        return float('inf')
    if smoke > SMOKE_BLOCK_THRESHOLD:
        return float('inf')
    if temp > TEMP_BLOCK_THRESHOLD:
        return float('inf')
    
    risk = 0.0
    
    # Flame Risk (0-100%) - As per documentation
    if flame > 0:
        if flame <= 10:
            risk += flame * FLAME_WEIGHT_LOW
        elif flame <= 20:
            risk += 10 * FLAME_WEIGHT_LOW + (flame - 10) * FLAME_WEIGHT_MEDIUM
        elif flame <= 40:
            risk += 10 * FLAME_WEIGHT_LOW + 10 * FLAME_WEIGHT_MEDIUM + (flame - 20) * FLAME_WEIGHT_HIGH
    
    # Smoke Risk (0-100%) - As per documentation
    if smoke > 10:
        if smoke <= 20:
            risk += (smoke - 10) * SMOKE_WEIGHT_LOW
        elif smoke <= 40:
            risk += 10 * SMOKE_WEIGHT_LOW + (smoke - 20) * SMOKE_WEIGHT_MEDIUM
        elif smoke <= 60:
            risk += 10 * SMOKE_WEIGHT_LOW + 20 * SMOKE_WEIGHT_MEDIUM + (smoke - 40) * SMOKE_WEIGHT_HIGH
    
    # Temperature Risk (°C) - Indian context (as per documentation)
    if temp > 45:
        if temp <= 50:
            risk += (temp - 45) * TEMP_WEIGHT_LOW
        elif temp <= 55:
            risk += 5 * TEMP_WEIGHT_LOW + (temp - 50) * TEMP_WEIGHT_MEDIUM
        elif temp <= 60:
            risk += 5 * TEMP_WEIGHT_LOW + 5 * TEMP_WEIGHT_MEDIUM + (temp - 55) * TEMP_WEIGHT_HIGH
    
    return risk