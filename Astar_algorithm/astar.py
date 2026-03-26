import heapq
import math
from risk import compute_risk, is_node_safe, get_node_risk

# Heuristic function using graph distances
def heuristic(node, goals, graph):
    """
    Heuristic uses actual graph distances when available,
    falls back to coordinate-based estimation for disconnected nodes
    """
    best = float("inf")
    
    for goal in goals:
        # Check if direct connection exists in graph
        direct_dist = None
        for neighbor, dist in graph[node]:
            if neighbor == goal:
                direct_dist = dist
                break
        
        if direct_dist is not None:
            # Use actual graph distance if directly connected
            dist = direct_dist
        else:
            # For disconnected nodes, use a combination of min edge distances
            # This is a better estimate than Euclidean for graph-based paths
            min_edge_from_node = min((dist for _, dist in graph[node]), default=float("inf"))
            min_edge_to_goal = min((dist for _, dist in graph[goal]), default=float("inf"))
            
            if min_edge_from_node != float("inf") and min_edge_to_goal != float("inf"):
                # Estimate via nearest common point
                dist = min_edge_from_node + min_edge_to_goal
            else:
                # Fallback to a large but finite number
                dist = 100
        
        best = min(best, dist)
    
    return best if best != float("inf") else 0


# Reconstruct path by following parent pointers
def reconstruct_path(came_from, current):
    path = [current]

    while current in came_from:
        current = came_from[current]
        path.append(current)

    path.reverse()
    return path


# Get available goal nodes based on safety conditions
def get_available_goals(primary_goals, secondary_goals, sensor_data):
    available_goals = []
    
    # Check primary goals (exits and safe room)
    for goal in primary_goals:
        if is_node_safe(goal, sensor_data):
            available_goals.append(goal)
    
    # If all primary goals are unsafe, use secondary goals (rooms)
    if not available_goals:
        for goal in secondary_goals:
            if is_node_safe(goal, sensor_data):
                available_goals.append(goal)
    
    return available_goals


# Dynamic risk-aware A* algorithm with adaptive goal selection
def dynamic_a_star(start, primary_goals, secondary_goals, graph, sensor_data):
    # Determine which goals are currently available
    available_goals = get_available_goals(primary_goals, secondary_goals, sensor_data)
    
    if not available_goals:
        print(f"No safe goals available for {start}")
        return None

    # Priority queue for nodes to explore
    open_set = []
    heapq.heappush(open_set, (0, start))

    # Parent tracking for path reconstruction
    came_from = {}

    # Cost from start to node (g_score)
    g_score = {node: float("inf") for node in graph}
    g_score[start] = 0

    # Expanded nodes
    closed = set()

    while open_set:
        _, current = heapq.heappop(open_set)

        if current in closed:
            continue

        # Stop when any available goal is reached
        if current in available_goals:
            return reconstruct_path(came_from, current)

        closed.add(current)

        # Explore neighbors
        for neighbor, base_dist in graph[current]:
            if neighbor in closed:
                continue

            # Get risk for this edge (average of current and neighbor risk)
            risk_current = get_node_risk(current, sensor_data)
            risk_neighbor = get_node_risk(neighbor, sensor_data)
            
            # If either node is completely unsafe, skip
            if risk_current == float("inf") or risk_neighbor == float("inf"):
                continue
            
            # Dynamic edge cost = base distance + average risk
            avg_risk = (risk_current + risk_neighbor) / 2
            edge_cost = base_dist + avg_risk

            # Tentative cost through current node
            tentative = g_score[current] + edge_cost

            if tentative < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative

                # f(n) = g(n) + h(n)
                f_score = tentative + heuristic(neighbor, available_goals, graph)

                heapq.heappush(open_set, (f_score, neighbor))

    # No valid path found
    return None