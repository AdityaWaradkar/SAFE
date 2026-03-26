import json


def load_graph(file_path):
    with open(file_path) as f:
        data = json.load(f)

    matrix = data["matrix"]
    graph = {}

    for i in range(len(matrix)):
        node_u = f"N{i+1}"
        graph[node_u] = []

        for j in range(len(matrix[i])):
            weight = matrix[i][j]
            
            # Convert "*" to 0 (no connection)
            if weight == "*":
                weight = 0

            if weight != 0:  # Only add edges with non-zero weight
                node_v = f"N{j+1}"
                graph[node_u].append((node_v, float(weight)))

    return graph