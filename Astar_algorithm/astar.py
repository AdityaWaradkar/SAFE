import heapq
import math
from risk import compute_risk


# Heuristic function (Euclidean distance to nearest goal)
def heuristic(node, goals, coordinates):

    x1, y1 = coordinates[node]

    best = float("inf")

    for g in goals:

        x2, y2 = coordinates[g]

        dist = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

        best = min(best, dist)

    return best


# Reconstruct path by following parent pointers
def reconstruct_path(came_from, current):

    path = [current]

    while current in came_from:
        current = came_from[current]
        path.append(current)

    path.reverse()

    return path


# Dynamic risk-aware A* algorithm
def dynamic_a_star(start, goals, graph, coordinates, sensor_data):

    # Priority queue for nodes to explore
    open_set = []
    heapq.heappush(open_set, (0, start))

    # Parent tracking for path reconstruction
    came_from = {}

    # Cost from start to node
    g_score = {node: float("inf") for node in graph}
    g_score[start] = 0

    # Expanded nodes
    closed = set()

    while open_set:

        _, current = heapq.heappop(open_set)

        if current in closed:
            continue

        # Stop when a goal node is reached
        if current in goals:
            return reconstruct_path(came_from, current)

        closed.add(current)

        # Explore neighbors
        for neighbor, dist in graph[current]:

            if neighbor in closed:
                continue

            # Compute dynamic risk of entering neighbor
            risk = compute_risk(neighbor, sensor_data)

            # Skip nodes that are unsafe
            if risk == float("inf"):
                continue

            # Tentative cost through current node
            tentative = g_score[current] + dist + risk

            if tentative < g_score[neighbor]:

                came_from[neighbor] = current
                g_score[neighbor] = tentative

                # f(n) = g(n) + h(n)
                f_score = tentative + heuristic(
                    neighbor,
                    goals,
                    coordinates
                )

                heapq.heappush(open_set, (f_score, neighbor))

    # No valid path found
    return None