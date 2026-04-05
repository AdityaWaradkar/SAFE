"""
Heuristic Function - Estimates remaining distance to nearest goal
As defined in the algorithm documentation (Section 4.4)
"""

from typing import Set

def calculate_heuristic(current_node: str, available_goals: Set[str], graph) -> float:
    """
    Calculate optimistic estimate of remaining cost to nearest goal.
    
    The heuristic is admissible (never overestimates actual cost)
    to guarantee optimal path finding.
    
    Returns:
        Estimated distance to the nearest goal
    """
    adjacency = graph.get_adjacency_list()
    best_estimate = float('inf')
    
    for goal in available_goals:
        # Check if direct connection exists
        direct_distance = None
        for neighbor, dist in adjacency.get(current_node, []):
            if neighbor == goal:
                direct_distance = dist
                break
        
        if direct_distance is not None:
            estimate = direct_distance
        else:
            # Estimate via minimum edge distances
            min_from_current = min(
                (dist for _, dist in adjacency.get(current_node, [])),
                default=float('inf')
            )
            min_to_goal = min(
                (dist for _, dist in adjacency.get(goal, [])),
                default=float('inf')
            )
            estimate = min_from_current + min_to_goal if min_from_current != float('inf') else 0
        
        best_estimate = min(best_estimate, estimate)
    
    return best_estimate if best_estimate != float('inf') else 0