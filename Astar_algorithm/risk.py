from config import ALPHA, BETA, GAMMA, T_SAFE, F_CRITICAL, SMOKE_CRITICAL

# Cache previous sensor data to detect changes
previous_sensor_data = {}
sensor_changed = False


# Check if sensor data has changed (ignoring people count)
def has_sensor_data_changed(new_data):
    global previous_sensor_data
    
    if not previous_sensor_data:
        previous_sensor_data = new_data
        return True
    
    for node_id, values in new_data.items():
        old_values = previous_sensor_data.get(node_id)
        if old_values:
            # Compare all except people count (index 3)
            if (values[0] != old_values[0] or  # flame
                values[1] != old_values[1] or  # smoke
                values[2] != old_values[2]):   # temperature
                previous_sensor_data = new_data
                return True
    
    previous_sensor_data = new_data
    return False


# Check if a node is safe enough to be a goal
def is_node_safe(node_id, sensor_data):
    # Convert graph node ID format (N1) → telemetry format (N_1)
    node_key = f"{node_id[0]}_{node_id[1:]}"
    
    # If sensor data is missing, assume unsafe
    if node_key not in sensor_data:
        return False
    
    values = sensor_data[node_key]
    
    # Extract sensor values
    flame = values[0]
    smoke = values[1]
    temp = values[2]
    
    # Node is unsafe if any value exceeds critical thresholds
    if flame > F_CRITICAL:
        return False
    if smoke > SMOKE_CRITICAL:
        return False
    if temp > T_SAFE * 2:  # Double the safe temperature is critical
        return False
    
    return True


# Get node risk value (without infinity for goal checking)
def get_node_risk(node_id, sensor_data):
    # Convert graph node ID format (N1) → telemetry format (N_1)
    node_key = f"{node_id[0]}_{node_id[1:]}"

    # If sensor data is missing, assume zero risk
    if node_key not in sensor_data:
        return 0

    values = sensor_data[node_key]

    # Extract sensor values
    flame = values[0]
    smoke = values[1]
    temp = values[2]

    # If any value exceeds critical threshold, node is unsafe
    if flame > F_CRITICAL or smoke > SMOKE_CRITICAL or temp > T_SAFE * 2:
        return float("inf")

    # Continuous risk model for traversal cost
    return (
        ALPHA * smoke +
        BETA * max(0, temp - T_SAFE) +
        GAMMA * flame
    )


# Compute dynamic risk value for a node (maintains backward compatibility)
def compute_risk(node_id, sensor_data):
    return get_node_risk(node_id, sensor_data)