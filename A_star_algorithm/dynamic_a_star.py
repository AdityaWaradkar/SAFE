import json
import heapq
import math
import requests

# ==========================================
# CONFIGURATION
# ==========================================

GRAPH_FILE = "graph.json"
DATA_URL = "https://safe-0vvn.onrender.com/data/nodes"

ALPHA = 1.5
BETA = 2.0
GAMMA = 3.0

T_SAFE = 40
F_CRITICAL = 70

SIZE = 20

GOAL_NODES = ["N20"]  # Exit


# ==========================================
# NODE ID MAPPING
# ==========================================

def id_to_index(node_id):
    return int(node_id[1:]) - 1


def index_to_id(index):
    return f"N{index + 1}"


# ==========================================
# LOAD GRAPH
# ==========================================

with open(GRAPH_FILE, "r") as f:
    graph_data = json.load(f)

matrix = graph_data["matrix"]


def build_graph(matrix):
    graph = {index_to_id(i): [] for i in range(len(matrix))}

    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            weight = matrix[i][j]
            if weight != 0 and weight != "*":
                node_u = index_to_id(i)
                node_v = index_to_id(j)
                graph[node_u].append((node_v, weight))

    return graph


GRAPH = build_graph(matrix)

print("Connections from N1:", GRAPH["N1"])


# ==========================================
# COORDINATES (GRID ASSUMPTION)
# ==========================================

COORDINATES = {
    index_to_id(i): (i % 5, i // 5)
    for i in range(SIZE)
}


# ==========================================
# FETCH SENSOR DATA
# ==========================================

def fetch_sensor_data():
    print("Fetching sensor data...")
    response = requests.get(DATA_URL)
    print("HTTP Status:", response.status_code)

    data = response.json()

    if "nodes" not in data:
        return {}

    return data["nodes"]


# ==========================================
# RISK FUNCTION
# ==========================================

def compute_risk(node_id, sensor_data):

    if node_id not in sensor_data:
        return 0

    node = sensor_data[node_id]

    F = node.get("flame", 0)
    S = node.get("smoke", 0)
    T = node.get("temperature", 0)

    if F > F_CRITICAL:
        return float("inf")

    risk = (
        ALPHA * S +
        BETA * max(0, T - T_SAFE) +
        GAMMA * F
    )

    return risk


# ==========================================
# HEURISTIC FUNCTION
# ==========================================

def heuristic(node, goals):
    x1, y1 = COORDINATES[node]

    min_dist = float("inf")

    for g in goals:
        x2, y2 = COORDINATES[g]
        dist = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
        min_dist = min(min_dist, dist)

    return min_dist


# ==========================================
# DYNAMIC RISK-AWARE A*
# ==========================================

def dynamic_a_star(start, goals, sensor_data):

    open_set = []
    heapq.heappush(open_set, (0, start))

    came_from = {}

    g_score = {node: float("inf") for node in GRAPH}
    g_score[start] = 0

    f_score = {node: float("inf") for node in GRAPH}
    f_score[start] = heuristic(start, goals)

    closed_set = set()

    while open_set:

        _, current = heapq.heappop(open_set)

        if current in closed_set:
            continue

        if current in goals:
            return reconstruct_path(came_from, current), g_score[current]

        closed_set.add(current)

        for neighbor, distance in GRAPH[current]:

            if neighbor in closed_set:
                continue

            risk = compute_risk(neighbor, sensor_data)

            if risk == float("inf"):
                continue

            tentative_g = g_score[current] + distance + risk

            if tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goals)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None, float("inf")


def reconstruct_path(came_from, current):
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path


# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":

    sensor_data = fetch_sensor_data()

    if not sensor_data:
        print("Sensor data unavailable.")
        exit()

    start_node = "N1"

    print("\nRunning Dynamic Risk-Aware A*...\n")

    path, cost = dynamic_a_star(start_node, GOAL_NODES, sensor_data)

    if path:
        print("Optimal Evacuation Path:", path)
        print("Total Cost:", cost)
    else:
        print("No safe path found.")
