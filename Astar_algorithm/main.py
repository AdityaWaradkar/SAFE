import time
import threading

from flask import Flask, jsonify
from flask_cors import CORS

from config import (
    ROOM_NODES, PRIMARY_GOAL_NODES, SECONDARY_GOAL_NODES,
    SIZE, INTERVAL, API_PORT
)
from graph_loader import load_graph
from telemetry import fetch_sensor_data
from astar import dynamic_a_star
from risk import has_sensor_data_changed, get_node_risk

# Load building graph from adjacency matrix
GRAPH = load_graph("graph.json")

# Stores latest computed evacuation paths
latest_paths = {}

# Stores previous sensor data for change detection
previous_sensor_data = {}


# Compute path metrics for visualization
def compute_path_metrics(path, sensor_data):
    if not path:
        return None
    
    total_risk = 0
    segment_risks = []
    
    for i in range(len(path) - 1):
        node_a = path[i].replace("_", "")
        node_b = path[i + 1].replace("_", "")
        
        risk_a = get_node_risk(node_a, sensor_data)
        risk_b = get_node_risk(node_b, sensor_data)
        
        if risk_a == float("inf") or risk_b == float("inf"):
            segment_risk = float("inf")
        else:
            segment_risk = (risk_a + risk_b) / 2
        
        segment_risks.append({
            "from": path[i],
            "to": path[i + 1],
            "risk": segment_risk if segment_risk != float("inf") else 999
        })
        
        if segment_risk != float("inf"):
            total_risk += segment_risk
    
    # Find the most dangerous segment
    max_risk_segment = max(segment_risks, key=lambda x: x["risk"]) if segment_risks else None
    
    return {
        "total_risk": round(total_risk, 2),
        "segment_count": len(segment_risks),
        "most_dangerous": max_risk_segment,
        "segments": segment_risks
    }


# Run one full A* computation cycle
def run_cycle(force=False):
    global latest_paths, previous_sensor_data

    # Fetch latest sensor telemetry
    sensor_data = fetch_sensor_data()

    if not sensor_data:
        print("No sensor data available")
        return False

    # Check if sensor data changed (ignoring people count)
    if not force and not has_sensor_data_changed(sensor_data):
        return False

    print("\n" + "="*60)
    print("Sensor data changed - Running Dynamic A*")
    print("="*60)

    results = {}
    metrics = {}

    # Convert goal nodes to graph format (N_1 → N1)
    primary_goals = [g.replace("_", "") for g in PRIMARY_GOAL_NODES]
    secondary_goals = [g.replace("_", "") for g in SECONDARY_GOAL_NODES]

    # Compute evacuation path for each room
    for room in ROOM_NODES:
        # Convert node format (N_1 → N1)
        start = room.replace("_", "")

        path = dynamic_a_star(
            start,
            primary_goals,
            secondary_goals,
            GRAPH,
            sensor_data
        )

        if path:
            # Convert path back to telemetry format (N1 → N_1)
            path = [f"{n[0]}_{n[1:]}" for n in path]
            
            # FILTER: Check if path meets criteria
            # First node should be from ROOM_NODES (which it always is, since we start from room)
            # Last node should be from PRIMARY_GOAL_NODES (Safe Room or Exits)
            last_node = path[-1]
            
            # Only include path if last node is in PRIMARY_GOAL_NODES
            if last_node in PRIMARY_GOAL_NODES:
                results[room] = path
                metrics[room] = compute_path_metrics(path, sensor_data)
                print(f"✓ {room:4} → {' → '.join(path)}")
            else:
                # Path ends in secondary goal (room), filter it out
                results[room] = None
                metrics[room] = None
                print(f"✗ {room:4} → Path ends in {last_node} (not a primary goal)")
        else:
            results[room] = None
            metrics[room] = None
            print(f"✗ {room:4} → No safe path")

    latest_paths = {
        "paths": results,
        "metrics": metrics,
        "timestamp": time.time(),
        "trigger": "sensor_change" if not force else "periodic"
    }
    
    # Print goal status summary
    print("\n" + "-"*60)
    print("Goal Node Status:")
    for goal in PRIMARY_GOAL_NODES + SECONDARY_GOAL_NODES:
        goal_key = goal.replace("_", "")
        from risk import is_node_safe
        status = "SAFE" if is_node_safe(goal_key, sensor_data) else "UNSAFE"
        print(f"  {goal:4}: {status}")
    print("="*60 + "\n")
    
    return True


# Background loop with change detection
def algorithm_loop():
    # Run initial computation
    run_cycle(force=True)
    
    while True:
        # This will only trigger recomputation if sensor data changed
        run_cycle(force=False)
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


# Endpoint returning latest computed paths with metrics
@app.route("/paths")
def get_paths():
    if "paths" in latest_paths:
        return jsonify(latest_paths["paths"])
    return jsonify({})


# Endpoint returning path metrics for visualization
@app.route("/paths/metrics")
def get_path_metrics():
    if "metrics" in latest_paths:
        return jsonify({
            "metrics": latest_paths["metrics"],
            "timestamp": latest_paths.get("timestamp"),
            "trigger": latest_paths.get("trigger")
        })
    return jsonify({"metrics": {}})


# Endpoint returning goal node status
@app.route("/goals/status")
def goal_status():
    sensor_data = fetch_sensor_data()
    if not sensor_data:
        return jsonify({"error": "No sensor data"}), 503
    
    from risk import is_node_safe
    
    status = {}
    for goal in PRIMARY_GOAL_NODES + SECONDARY_GOAL_NODES:
        goal_key = goal.replace("_", "")
        status[goal] = {
            "is_safe": is_node_safe(goal_key, sensor_data),
            "type": "primary" if goal in PRIMARY_GOAL_NODES else "secondary"
        }
    
    return jsonify(status)


# Endpoint returning system status
@app.route("/status")
def system_status():
    return jsonify({
        "status": "running",
        "last_update": latest_paths.get("timestamp"),
        "last_trigger": latest_paths.get("trigger"),
        "active_paths": len([p for p in latest_paths.get("paths", {}).values() if p]),
        "total_sources": len(ROOM_NODES)
    })


# Basic health check endpoint
@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    print("="*60)
    print("A* Evacuation Service Started")
    print("="*60)
    print(f"Primary goals (exits + safe room): {PRIMARY_GOAL_NODES}")
    print(f"Secondary goals (rooms): {SECONDARY_GOAL_NODES}")
    print(f"Source nodes: {ROOM_NODES}")
    print(f"Update interval: {INTERVAL} seconds")
    print(f"Event-driven: Yes (flame/smoke/temp changes)")
    print("="*60 + "\n")

    # Start A* computation loop in background thread
    thread = threading.Thread(target=algorithm_loop)
    thread.daemon = True
    thread.start()

    # Start API server
    app.run(host="0.0.0.0", port=API_PORT)