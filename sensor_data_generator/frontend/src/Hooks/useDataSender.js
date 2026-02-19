import { useEffect, useRef } from "react";

const INTERVAL = 5000;

/**
 * 🔥 ENDPOINTS
 * Replace CLOUD_BASE with your actual Render URL
 */
const LAN_BASE = "http://192.168.4.1:5000/data";
const CLOUD_BASE = "https://safe-0vvn.onrender.com/data";

/**
 * ---- STATIC METADATA ----
 */
const SYSTEM_ID = "SAFE-FLOOR-1";
const FLOOR_ID = "floor-1";
const SYSTEM_MODE = "ACTIVE";
const ACTIVE_PATH_ID = "PATH-TEST-001";

export default function useDataSender(state) {
  const ref = useRef(state);

  /**
   * Always keep latest state in ref
   */
  useEffect(() => {
    ref.current = state;
  }, [state]);

  /**
   * Interval sender
   */
  useEffect(() => {
    const timer = setInterval(() => {
      const snapshot = ref.current;

      if (!snapshot || !snapshot.nodes) {
        console.warn("No snapshot data available");
        return;
      }

      const timestamp = new Date().toISOString();

      const totalPeople = calculateTotalPeople(snapshot);

      const payload = {
        systemId: SYSTEM_ID,
        floorId: FLOOR_ID,
        systemMode: SYSTEM_MODE,
        timestamp,
        source: {
          deviceType: "ESP",
          deviceId: "ESP-NODES-01",
        },
        occupancy: {
          people_count_before_switching: totalPeople,
          curr_people_count: "N/A",
        },
        activeEvacuationPathId: ACTIVE_PATH_ID,
        nodes: mapNodes(snapshot.nodes),
      };

      console.log("Sending payload...");

      // 🔥 Critical path → LAN
      send(`${LAN_BASE}/nodes`, payload);

      // ☁️ Cloud monitoring
      send(`${CLOUD_BASE}/nodes`, payload);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);
}

/**
 * ---------------- HELPERS ----------------
 */

function calculateTotalPeople(snapshot) {
  let total = 0;

  for (const values of Object.values(snapshot.nodes)) {
    total += values?.[3] || 0;
  }

  return total;
}

function mapNodes(nodes) {
  return Object.fromEntries(
    Object.entries(nodes).map(([key, values]) => [
      key,
      {
        flame: values?.[0] ?? 0,
        smoke: values?.[1] ?? 0,
        temperature: values?.[2] ?? 0,
        people_count: values?.[3] ?? 0,
        curr_people_count: "N/A",
      },
    ]),
  );
}

async function send(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ Failed to send to ${url}`, response.status);
    } else {
      console.log(`✅ Sent successfully to ${url}`);
    }
  } catch (err) {
    console.error(`🚫 Endpoint unreachable: ${url}`, err.message);
  }
}
