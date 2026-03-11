***


# Astar Algorithm Module

SAFE System

***


# 1. Overview

The **Astar\_algorithm module** computes optimal evacuation paths for the SAFE evacuation system using a dynamic risk-aware implementation of the **A\*** pathfinding algorithm.

The algorithm evaluates multiple safety factors such as:

- flame intensity

- smoke density

- temperature levels

and determines the **safest path from occupied rooms to the nearest safe destination**.

The module operates continuously by:

1. Fetching real-time sensor telemetry from the SAFE telemetry backend.

2. Computing dynamic risk values for each node.

3. Running the A\* pathfinding algorithm for every room node.

4. Exposing computed evacuation paths through an API endpoint.

This service acts as the **decision engine of the evacuation system**.

***


# 2. System Architecture

    Astar_algorithm
    │
    ├── config.py
    ├── graph.json
    ├── graph_loader.py
    ├── telemetry.py
    ├── risk.py
    ├── astar.py
    └── main.py

Each component performs a dedicated task in the path planning pipeline.

***


# 3. Module Responsibilities

The Astar\_algorithm module performs the following functions:

- Fetch sensor telemetry data.

- Convert sensor values into risk scores.

- Load building topology from a graph representation.

- Compute optimal evacuation paths using A\*.

- Update paths periodically based on live data.

- Expose the latest evacuation routes through an HTTP API.

The module is designed to run on both:

- development machines (local PC)

- embedded controllers such as a **Raspberry Pi**.

***


# 4. Graph Representation

The building floor is represented as a **weighted graph**.

    G = (V, E)

Where:

    V = set of nodes
    E = set of edges

Nodes represent physical locations such as:

- rooms

- corridor intersections

- exits

- safe rooms

Edges represent walkable connections between nodes.

Each edge has a **distance weight**:

    D(u, v)

The graph structure is stored in:

    graph.json

This file contains an **adjacency matrix** describing connections between nodes.

Example:

    N1 — 10 — N2
    N2 — 10 — N6
    N6 — 18 — N15
    N15 — 22 — N20

The graph is loaded at runtime by the **graph\_loader module**.

***


# 5. Sensor Telemetry Input

The algorithm receives sensor data from the SAFE telemetry backend.

Example endpoint:

    http://localhost:5000/data/nodes

Other supported sources:

    LAN:
    http://192.168.4.1:8080/data/nodes

    Cloud:
    https://safe-0vvn.onrender.com/data/nodes

Telemetry format:

    {
      "nodes": {
        "N_1": [flame, smoke, temperature, people],
        "N_2": [flame, smoke, temperature, people]
      }
    }

Example node:

    "N_1": [10, 10, 30, 12]

Where:

| Index | Sensor           |
| ----- | ---------------- |
| 0     | flame percentage |
| 1     | smoke percentage |
| 2     | temperature (°C) |
| 3     | people count     |

The **people count value is not used in A\*** calculations.

Only the first three values influence risk computation.

***


# 6. Risk Model

Each node is assigned a **dynamic risk value**.

Risk function:

    R(v) = αS(v) + β max(0, T(v) − Tsafe) + γF(v)

Where:

| Symbol | Meaning         |
| ------ | --------------- |
| S(v)   | smoke level     |
| T(v)   | temperature     |
| F(v)   | flame intensity |

Parameters:

    ALPHA = smoke weight
    BETA = temperature weight
    GAMMA = flame weight

Temperature contributes to risk only when it exceeds a safe threshold:

    T_SAFE

***


## Flame Safety Cutoff

If flame exceeds a critical threshold:

    F(v) > F_CRITICAL

The node becomes **impassable**:

    R(v) = ∞

This prevents the algorithm from selecting dangerous paths.

***


# 7. A\* Path Planning

The algorithm uses a **dynamic risk-aware version of A\***.

Evaluation function:

    f(n) = g(n) + h(n)

Where:

    g(n) = accumulated cost
    h(n) = heuristic distance to goal

***


## Accumulated Cost

    g(v) = g(u) + D(u,v) + R(v)

Meaning the path cost considers:

- travel distance

- hazard risk

***


## Heuristic Function

The heuristic estimates distance to the nearest safe destination using Euclidean distance:

    h(n) = sqrt((xn - xg)^2 + (yn - yg)^2)

Goals include:

    safe rooms
    exits

The heuristic does **not include risk values**, ensuring optimal A\* performance.

***


# 8. Start and Goal Nodes

Nodes are grouped according to building layout.

Example configuration:

    Room nodes
    Conference room nodes
    Corridor nodes
    Safe room nodes
    Exit nodes

Evacuation paths are computed for:

    Room nodes
    Conference room nodes

These nodes represent **possible starting points of evacuation**.

Goal nodes are:

    Safe rooms
    Exits

***


# 9. Execution Cycle

The A\* service runs continuously.

Every cycle performs the following steps:

1. Fetch latest sensor telemetry.

2. Compute risk values for nodes.

3. Run A\* pathfinding for each room node.

4. Store computed evacuation paths.

5. Update the API response.

Execution interval:

    INTERVAL = 5 seconds

***


# 10. API Server

The module exposes evacuation paths through a lightweight **Flask API server**.

Default port:

    7000

***


## Paths Endpoint

    GET /paths

Returns the latest evacuation routes.

Example response:

    {
      "N_1": ["N_1","N_2","N_6","N_15","N_20"],
      "N_4": ["N_4","N_7","N_11"]
    }

Each key represents a **starting node**, and the array represents the **evacuation path**.

***


## Health Endpoint

    GET /health

Response:

    {
      "status": "ok"
    }

This endpoint is used to verify that the service is running.

***


# 11. Running the Module

## Install Dependencies

Navigate to the module directory:

    cd Astar_algorithm

Create a virtual environment:

    python3 -m venv venv

Activate the environment:

    source venv/bin/activate

Install required packages:

    pip install requests flask

***


## Start the Service

Run the algorithm service:

    python main.py

The server will start and begin computing evacuation paths.

***


# 12. Accessing the API

Open the paths endpoint in a browser:

    http://localhost:7000/paths

Health endpoint:

    http://localhost:7000/health

***


# 13. Typical Development Workflow

1. Start the **sensor\_value\_generator backend**.

2. Start the **Astar\_algorithm service**.

3. Adjust sensor values in the frontend simulator.

4. Observe updated evacuation paths through the `/paths` endpoint.

Paths will automatically update every **5 seconds**.

***


# 14. Role in SAFE System

The Astar\_algorithm module is the **core decision engine** of the SAFE evacuation system.

It transforms real-time sensor data into actionable evacuation routes.

The module enables the system to:

- dynamically avoid fire hazards

- minimize smoke exposure

- reduce heat exposure

- guide occupants toward the safest exit

Because the algorithm runs continuously, the evacuation routes adapt in real time to changing hazard conditions.

***
