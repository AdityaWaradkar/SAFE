"""
Path Router - Main A* Path Routing Algorithm
As defined in the algorithm documentation (Section 5, Phase 6)
"""

import heapq
from typing import Set, Dict, List, Optional
from app.core.heuristic import calculate_heuristic
from app.core.occupancy_penalty import calculate_occupancy_penalty
from app.config.node_types import get_node_type

def find_optimal_path(
    source: str,
    available_goals: Set[str],
    graph,
    risk_map: Dict[str, float],
    occupancy_map: Dict[str, int]
) -> Optional[List[str]]:
    """
    Find optimal path from source to any available goal.
    
    Edge Cost = Physical Distance + Edge Risk + Edge Occupancy
    Where:
        - Edge Risk = (Risk(u) + Risk(v)) / 2
        - Edge Occupancy = (Penalty(u) + Penalty(v)) / 2
    
    Returns:
        List of node IDs representing the optimal path,
        or None if no path exists
    """
    adjacency = graph.get_adjacency_list()
    
    # Step 1: Initialization
    open_set = [(calculate_heuristic(source, available_goals, graph), source)]
    cost_from_start = {node: float('inf') for node in adjacency}
    cost_from_start[source] = 0
    parent = {}
    explored = set()
    
    # Step 2: Main Loop
    while open_set:
        _, current = heapq.heappop(open_set)
        
        # Goal reached
        if current in available_goals:
            path = [current]
            while current in parent:
                current = parent[current]
                path.append(current)
            path.reverse()
            return path
        
        # Already explored
        if current in explored:
            continue
        
        explored.add(current)
        
        # Explore neighbors
        for neighbor, distance in adjacency.get(current, []):
            if neighbor in explored:
                continue
            
            # Skip hazardous nodes
            if risk_map.get(neighbor, 0) == float('inf'):
                continue
            
            # Calculate Edge Cost = Distance + Edge Risk + Edge Occupancy
            edge_risk = (risk_map.get(current, 0) + risk_map.get(neighbor, 0)) / 2
            
            node_type_u = get_node_type(current)
            node_type_v = get_node_type(neighbor)
            occ_penalty = (
                calculate_occupancy_penalty(occupancy_map.get(current, 0), node_type_u) +
                calculate_occupancy_penalty(occupancy_map.get(neighbor, 0), node_type_v)
            ) / 2
            
            edge_cost = distance + edge_risk + occ_penalty
            tentative_cost = cost_from_start[current] + edge_cost
            
            # Update if better path found
            if tentative_cost < cost_from_start[neighbor]:
                parent[neighbor] = current
                cost_from_start[neighbor] = tentative_cost
                heuristic = calculate_heuristic(neighbor, available_goals, graph)
                heapq.heappush(open_set, (tentative_cost + heuristic, neighbor))
    
    # Step 3: No path found
    return None