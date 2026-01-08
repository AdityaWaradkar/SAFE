import { useEffect, useRef } from "react";

const INTERVAL = 5000;

// Backend endpoints (both include /data)
const PROD_BASE = "https://safe-0vvn.onrender.com/data";
const LOCAL_BASE = "http://localhost:3000/data";

// Auto-switch environment
const BASE = window.location.hostname === "localhost" ? LOCAL_BASE : PROD_BASE;

export default function useDataSender(state) {
  const ref = useRef(state);

  useEffect(() => {
    ref.current = state;
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      const snapshot = ref.current;
      const timestamp = new Date().toISOString();

      // Rooms → /data/room1, /data/room2, ...
      Object.entries(snapshot.rooms).forEach(([id, values]) => {
        send(`${BASE}/${id}`, timestamp, id, values);
      });

      // Corridors → /data/corridor1, /data/corridor2, ...
      Object.entries(snapshot.corridors).forEach(([id, values]) => {
        send(`${BASE}/${id}`, timestamp, id, values);
      });

      // Conference Room → /data/A, /data/B
      ["A", "B"].forEach((channel) => {
        send(
          `${BASE}/${channel}`,
          timestamp,
          channel,
          snapshot.conferenceRoom[channel]
        );
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);
}

function send(url, timestamp, region, values) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp,
      region,
      data: {
        flame: values[0],
        smoke: values[1],
        temperature: values[2],
      },
    }),
  }).catch((err) => {
    console.error("Send failed:", err);
  });
}
