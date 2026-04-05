"""
Node Types and Classification
As defined in the algorithm documentation
"""

NODE_LOCATIONS = {
    "Room": ["N_1", "N_14", "N_8", "N_13", "N_18"],
    "Corridor": ["N_2", "N_6", "N_15", "N_16", "N_17", "N_12", "N_9", "N_10", "N_5"],
    "Conference Room": ["N_4", "N_7"],
    "Safe Room": ["N_19"],
    "Exits": ["N_20", "N_11", "N_3"],
}

# Source nodes = All rooms that need evacuation paths
SOURCE_NODES = NODE_LOCATIONS["Room"] + NODE_LOCATIONS["Conference Room"]

# Primary goals = Exits + Safe Room
PRIMARY_GOALS = NODE_LOCATIONS["Exits"] + NODE_LOCATIONS["Safe Room"]

# Secondary goals = Rooms + Conference Rooms (fallback)
SECONDARY_GOALS = NODE_LOCATIONS["Room"] + NODE_LOCATIONS["Conference Room"]

def is_source_node(node_id: str) -> bool:
    """Check if node is a source (requires evacuation path)"""
    return node_id in SOURCE_NODES

def is_primary_goal(node_id: str) -> bool:
    """Check if node is a primary goal (exit or safe room)"""
    return node_id in PRIMARY_GOALS

def is_secondary_goal(node_id: str) -> bool:
    """Check if node is a secondary goal (room for shelter)"""
    return node_id in SECONDARY_GOALS

def get_node_type(node_id: str) -> str:
    """Get the type of node"""
    if node_id in PRIMARY_GOALS:
        return "primary"
    elif node_id in SECONDARY_GOALS:
        return "secondary"
    elif node_id in NODE_LOCATIONS["Corridor"]:
        return "corridor"
    else:
        return "unknown"