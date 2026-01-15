import { useEffect, useRef } from "react";

const INTERVAL = 5000;

const PROD_BASE = "https://safe-0vvn.onrender.com/data";
const LOCAL_BASE = "http://localhost:3000/data";

const BASE = window.location.hostname === "localhost" ? LOCAL_BASE : PROD_BASE;

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

      const timestamp = new Date().toISOString();
      const receivedAt = new Date().toISOString();

      // ---- GLOBAL PEOPLE COUNT (DERIVED) ----
      const totalPeople = calculateTotalPeople(snapshot);

      const globalOccupancy = {
        people_count_before_switching: totalPeople,
        curr_people_count: "N/A",
      };

      // ---------------- ROOMS ----------------
      send(`${BASE}/rooms`, {
        systemId: SYSTEM_ID,
        floorId: FLOOR_ID,
        systemMode: SYSTEM_MODE,
        timestamp,
        receivedAt,

        source: {
          deviceType: "ESP",
          deviceId: "ESP-ROOMS-01",
        },

        occupancy: globalOccupancy,

        activeEvacuationPathId: ACTIVE_PATH_ID,

        rooms: mapGroup(snapshot.rooms, true),
      });

      // ---------------- CORRIDORS ----------------
      send(`${BASE}/corridors`, {
        systemId: SYSTEM_ID,
        floorId: FLOOR_ID,
        systemMode: SYSTEM_MODE,
        timestamp,
        receivedAt,

        source: {
          deviceType: "ESP",
          deviceId: "ESP-CORRIDORS-01",
        },

        occupancy: globalOccupancy,

        activeEvacuationPathId: ACTIVE_PATH_ID,

        corridors: mapGroup(snapshot.corridors, false),
      });

      // ---------------- CONFERENCE ROOM ----------------
      send(`${BASE}/conference`, {
        systemId: SYSTEM_ID,
        floorId: FLOOR_ID,
        systemMode: SYSTEM_MODE,
        timestamp,
        receivedAt,

        source: {
          deviceType: "ESP",
          deviceId: "ESP-CONFERENCE-01",
        },

        occupancy: globalOccupancy,

        activeEvacuationPathId: ACTIVE_PATH_ID,

        conferenceRoom: {
          A: toObject(snapshot.conferenceRoom.A, true),
          B: toObject(snapshot.conferenceRoom.B, true),
        },
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);
}

// ---------- HELPERS ----------

// Sum people from rooms + conference room doors
function calculateTotalPeople(snapshot) {
  let total = 0;

  // Rooms
  for (const values of Object.values(snapshot.rooms)) {
    total += values[3] || 0;
  }

  // Conference room doors
  total += snapshot.conferenceRoom.A[3] || 0;
  total += snapshot.conferenceRoom.B[3] || 0;

  return total;
}

// group = rooms or corridors
function mapGroup(group, includePeople) {
  return Object.fromEntries(
    Object.entries(group).map(([key, values]) => [
      key,
      toObject(values, includePeople),
    ])
  );
}

// values = [flame, smoke, temperature, people_count]
function toObject(values, includePeople) {
  const obj = {
    flame: values[0],
    smoke: values[1],
    temperature: values[2],
  };

  if (includePeople) {
    obj.people_count = values[3];
    obj.curr_people_count = "N/A";
  }

  return obj;
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

//-----------------------Previous Data Sending Format//-----------------------//

// import { useEffect, useRef } from "react";

// const INTERVAL = 5000;

// const PROD_BASE = "https://safe-0vvn.onrender.com/data";
// const LOCAL_BASE = "http://localhost:3000/data";

// const BASE = window.location.hostname === "localhost" ? LOCAL_BASE : PROD_BASE;

// export default function useDataSender(state) {
//   const ref = useRef(state);

//   useEffect(() => {
//     ref.current = state;
//   }, [state]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const snapshot = ref.current;
//       const timestamp = new Date().toISOString();

//       // Rooms
//       send(`${BASE}/rooms`, {
//         timestamp,
//         rooms: mapValues(snapshot.rooms),
//       });

//       // Corridors
//       send(`${BASE}/corridors`, {
//         timestamp,
//         corridors: mapValues(snapshot.corridors),
//       });

//       // Conference Room
//       send(`${BASE}/conference`, {
//         timestamp,
//         conferenceRoom: {
//           A: toObject(snapshot.conferenceRoom.A),
//           B: toObject(snapshot.conferenceRoom.B),
//         },
//       });
//     }, INTERVAL);

//     return () => clearInterval(timer);
//   }, []);
// }

// function mapValues(group) {
//   return Object.fromEntries(
//     Object.entries(group).map(([key, values]) => [key, toObject(values)])
//   );
// }

// function toObject(values) {
//   return {
//     flame: values[0],
//     smoke: values[1],
//     temperature: values[2],
//   };
// }

// function send(url, payload) {
//   fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   }).catch((err) => {
//     console.error("Send failed:", err);
//   });
// }
