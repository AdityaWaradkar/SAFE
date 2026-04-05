"""
System Constants
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Server Configuration
API_PORT = int(os.getenv("PORT", 7000))
HOST = os.getenv("HOST", "0.0.0.0")

# Algorithm Parameters
INTERVAL_SECONDS = int(os.getenv("INTERVAL_SECONDS", 5))
SENSOR_DATA_URL = os.getenv("SENSOR_DATA_URL", "http://localhost:5000/data/nodes")

# Algorithm Weights (as per documentation)
OCCUPANCY_PENALTY_WEIGHT = 0.5
PRIORITY_OCCUPANCY_WEIGHT = 0.7
PRIORITY_RISK_WEIGHT = 0.3
HEURISTIC_WEIGHT = 1.0
MAX_PRACTICAL_RISK = 200.0

# Node Capacities for occupancy calculation
NODE_CAPACITIES = {
    "Room": 10,
    "Corridor": 20,
    "Conference Room": 30,
    "Safe Room": 50,
    "Exit": 100
}