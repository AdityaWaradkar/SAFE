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

            if weight != 0 and weight != "*":

                node_v = f"N{j+1}"

                graph[node_u].append((node_v, weight))

    return graph