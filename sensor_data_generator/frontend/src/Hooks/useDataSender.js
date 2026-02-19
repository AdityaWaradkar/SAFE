import { useEffect, useRef } from "react";

const INTERVAL = 5000;

// 🔥 ALWAYS send to RPi LAN
const BASE = "http://192.168.4.1:5000/data";

// ---- STATIC METADATA ----
const SYSTEM_ID = "SAFE-FLOOR-1";
const FLOOR_ID = "floor-1";
const SYSTEM_MODE = "ACTIVE";
const ACTIVE_PATH_ID = "PATH-TEST-001";

export default function useDataSender(state) {
  const ref = useRef(state);

  useEffect(() => {
    ref.current = state;
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      const snapshot = ref.current;
      if (!snapshot || !snapshot.nodes) return;

      const timestamp = new Date().toISOString();
      const receivedAt = new Date().toISOString();

      const totalPeople = calculateTotalPeople(snapshot);

      const globalOccupancy = {
        people_count_before_switching: totalPeople,
        curr_people_count: "N/A",
      };

      const payload = {
        systemId: SYSTEM_ID,
        floorId: FLOOR_ID,
        systemMode: SYSTEM_MODE,
        timestamp,
        receivedAt,
        source: {
          deviceType: "ESP",
          deviceId: "ESP-NODES-01",
        },
        occupancy: globalOccupancy,
        activeEvacuationPathId: ACTIVE_PATH_ID,
        nodes: mapNodes(snapshot.nodes),
      };

      // 🔥 Send to LAN (critical path)
      send(`${LAN_BASE}/nodes`, payload);

      // ☁️ Send to Cloud (non-blocking)
      send(`${CLOUD_BASE}/nodes`, payload);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);
}

// ---------- HELPERS ----------

function calculateTotalPeople(snapshot) {
  let total = 0;

  for (const values of Object.values(snapshot.nodes)) {
    total += values[3] || 0;
  }

  return total;
}

function mapNodes(nodes) {
  return Object.fromEntries(
    Object.entries(nodes).map(([key, values]) => [
      key,
      {
        flame: values[0],
        smoke: values[1],
        temperature: values[2],
        people_count: values[3],
        curr_people_count: "N/A",
      },
    ]),
  );
}

async function send(url, payload) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("RPi unreachable:", url);
  }
}
