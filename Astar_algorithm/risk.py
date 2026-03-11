from config import ALPHA, BETA, GAMMA, T_SAFE, F_CRITICAL


# Compute dynamic risk value for a node
def compute_risk(node_id, sensor_data):

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

    # If flame exceeds critical threshold, node is unsafe
    if flame > F_CRITICAL:
        return float("inf")

    # Continuous risk model
    return (
        ALPHA * smoke +
        BETA * max(0, temp - T_SAFE) +
        GAMMA * flame
    )