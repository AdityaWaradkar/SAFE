# URL of sensor telemetry source
DATA_URL = "http://localhost:5000/data/nodes"
# DATA_URL = "http://192.168.4.1:8080/data/nodes"
# DATA_URL = "https://safe-0vvn.onrender.com/data/nodes"


# Interval (seconds) between A* runs
INTERVAL = 5


# API server port for exposing computed paths
API_PORT = 7000


# Risk model weights
ALPHA = 1.2     # smoke weight
BETA = 1.8      # temperature weight
GAMMA = 4.0     # flame weight


# Safety thresholds
T_SAFE = 40     # temperature threshold
F_CRITICAL = 60 # flame threshold


# Total number of nodes in the graph
SIZE = 20


# Node layout (must match frontend configuration)
NODE_LOCATIONS = {

    "Room": [
        "N_1", "N_14", "N_8", "N_13", "N_18"
    ],

    "Corridor": [
        "N_2", "N_6", "N_15", "N_16", "N_17",
        "N_12", "N_9", "N_10", "N_5"
    ],

    "Conference Room": [
        "N_4", "N_7"
    ],

    "Safe Room": [
        "N_19"
    ],

    "Exits": [
        "N_20", "N_11", "N_3"
    ],
}


# Nodes where evacuation paths originate
ROOM_NODES = (
    NODE_LOCATIONS["Room"]
    + NODE_LOCATIONS["Conference Room"]
)


# Safe destination nodes
GOAL_NODES = (
    NODE_LOCATIONS["Safe Room"]
    + NODE_LOCATIONS["Exits"]
)