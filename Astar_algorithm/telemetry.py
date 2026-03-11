import requests
from config import DATA_URL


# Fetch latest sensor telemetry from backend
def fetch_sensor_data():

    try:
        # Request latest node data
        response = requests.get(DATA_URL, timeout=5)

        # If request failed, return empty dataset
        if response.status_code != 200:
            return {}

        data = response.json()

        # Extract nodes dictionary from response
        return data.get("nodes", {})

    except Exception:
        # Network error or invalid response
        return {}