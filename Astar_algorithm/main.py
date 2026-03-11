import time
import threading

from flask import Flask, jsonify
from flask_cors import CORS

from config import ROOM_NODES, GOAL_NODES, SIZE, INTERVAL, API_PORT
from graph_loader import load_graph
from telemetry import fetch_sensor_data
from astar import dynamic_a_star


# Load building graph from adjacency matrix
GRAPH = load_graph("graph.json")


# Generate coordinates for heuristic (grid layout assumption)
COORDINATES = {
    f"N{i+1}": (i % 5, i // 5)
    for i in range(SIZE)
}


# Stores latest computed evacuation paths
latest_paths = {}


# Run one full A* computation cycle
def run_cycle():

    global latest_paths

    # Fetch latest sensor telemetry
    sensor_data = fetch_sensor_data()

    if not sensor_data:
        print("No sensor data available")
        return

    print("\nRunning Dynamic A*")

    results = {}

    # Compute evacuation path for each room
    for room in ROOM_NODES:

        # Convert node format (N_1 → N1)
        start = room.replace("_", "")
        goals = [g.replace("_", "") for g in GOAL_NODES]

        path = dynamic_a_star(
            start,
            goals,
            GRAPH,
            COORDINATES,
            sensor_data
        )

        if path:
            # Convert path back to telemetry format (N1 → N_1)
            path = [f"{n[0]}_{n[1:]}" for n in path]
            results[room] = path
            print(room, "→", path)

        else:
            results[room] = None
            print(room, "→ No safe path")

    latest_paths = results


# Background loop running A* periodically
def algorithm_loop():

    while True:

        run_cycle()

        time.sleep(INTERVAL)


# Flask API server
app = Flask(__name__)

# Enable CORS for SAFE dashboard
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5143",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://safe-rho-ivory.vercel.app"
    ]}}
)


# Endpoint returning latest computed paths
@app.route("/paths")
def get_paths():
    return jsonify(latest_paths)


# Basic health check endpoint
@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":

    print("A* Evacuation Service Started")

    # Start A* computation loop in background thread
    thread = threading.Thread(target=algorithm_loop)
    thread.daemon = True
    thread.start()

    # Start API server
    app.run(host="0.0.0.0", port=API_PORT)