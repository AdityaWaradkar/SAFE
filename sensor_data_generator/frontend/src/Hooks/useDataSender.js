import { useEffect, useRef } from "react";

const INTERVAL = 5000;

const PROD_BASE = "https://safe-0vvn.onrender.com/data";
const LOCAL_BASE = "http://localhost:3000/data";

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

      // Rooms
      send(`${BASE}/rooms`, {
        timestamp,
        rooms: mapValues(snapshot.rooms),
      });

      // Corridors
      send(`${BASE}/corridors`, {
        timestamp,
        corridors: mapValues(snapshot.corridors),
      });

      // Conference Room
      send(`${BASE}/conference`, {
        timestamp,
        conferenceRoom: {
          A: toObject(snapshot.conferenceRoom.A),
          B: toObject(snapshot.conferenceRoom.B),
        },
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);
}

function mapValues(group) {
  return Object.fromEntries(
    Object.entries(group).map(([key, values]) => [key, toObject(values)])
  );
}

function toObject(values) {
  return {
    flame: values[0],
    smoke: values[1],
    temperature: values[2],
  };
}

function send(url, payload) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("Send failed:", err);
  });
}
