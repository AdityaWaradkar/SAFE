import { useEffect, useRef } from "react";

const INTERVAL = 5000;

const API_BASE = import.meta.env.VITE_SAFE_API_BASE;
const SYSTEM_ID = import.meta.env.VITE_SYSTEM_ID;
const FLOOR_ID = import.meta.env.VITE_FLOOR_ID;

const SYSTEM_MODE = "ACTIVE";
const ACTIVE_PATH_ID = "PATH-TEST-001";

export default function useDataSender(state) {
  const stateRef = useRef(state);

  // Keep latest state reference
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Send full node snapshot every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const snapshot = stateRef.current;

      if (!snapshot?.nodes) {
        console.warn("No snapshot data available");
        return;
      }

      const payload = {
        systemId: SYSTEM_ID,
        floorId: FLOOR_ID,
        systemMode: SYSTEM_MODE,
        timestamp: new Date().toISOString(),
        source: {
          deviceType: "ESP",
          deviceId: "ESP-NODES-01",
        },
        occupancy: {
          people_count_before_switching: calculateTotalPeople(snapshot),
          curr_people_count: "N/A",
        },
        activeEvacuationPathId: ACTIVE_PATH_ID,
        nodes: snapshot.nodes,
      };

      send(`${API_BASE}/nodes`, payload);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);
}

function calculateTotalPeople(snapshot) {
  let total = 0;

  for (const values of Object.values(snapshot.nodes)) {
    total += values?.[3] || 0;
  }

  return total;
}

async function send(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to send to ${url}`, response.status);
      return;
    }

    console.log(`Sent successfully to ${url}`);
  } catch (err) {
    console.error(`Endpoint unreachable: ${url}`, err.message);
  }
}
