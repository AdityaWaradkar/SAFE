import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Allowed frontend origins
 */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://safe-rho-ivory.vercel.app",
];

/**
 * CORS middleware (correct & stable)
 */
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, health checks)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

/**
 * In-memory snapshots
 */
let roomsSnapshot = null;
let corridorsSnapshot = null;
let conferenceSnapshot = null;

/**
 * ROOMS
 */
app.post("/data/rooms", (req, res) => {
  roomsSnapshot = {
    ...req.body,
    receivedAt: new Date().toISOString(),
  };

  res.status(200).json({ success: true });
});

app.get("/data/rooms", (_req, res) => {
  if (!roomsSnapshot) {
    return res.json({ message: "No rooms data received yet" });
  }

  res.json(roomsSnapshot);
});

/**
 * CORRIDORS
 */
app.post("/data/corridors", (req, res) => {
  corridorsSnapshot = {
    ...req.body,
    receivedAt: new Date().toISOString(),
  };

  res.status(200).json({ success: true });
});

app.get("/data/corridors", (_req, res) => {
  if (!corridorsSnapshot) {
    return res.json({ message: "No corridors data received yet" });
  }

  res.json(corridorsSnapshot);
});

/**
 * CONFERENCE ROOM (A & B)
 */
app.post("/data/conference", (req, res) => {
  conferenceSnapshot = {
    ...req.body,
    receivedAt: new Date().toISOString(),
  };

  res.status(200).json({ success: true });
});

app.get("/data/conference", (_req, res) => {
  if (!conferenceSnapshot) {
    return res.json({ message: "No conference data received yet" });
  }

  res.json(conferenceSnapshot);
});

/**
 * Health check
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
