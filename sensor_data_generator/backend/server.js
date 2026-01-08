import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Explicitly allowed frontend origins
 */
const ALLOWED_ORIGINS = [
  "https://safe-rho-ivory.vercel.app",
  "http://localhost:5173",
];

/**
 * In-memory store for latest snapshots
 * Keyed by region identifier
 */
const regionSnapshots = {};

/**
 * CORS configuration
 */
app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server or curl requests (no origin)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

/**
 * Receive data for a specific region
 * Example: POST /data/rooms/room1
 */
app.post("/data/:region", (req, res) => {
  const { region } = req.params;

  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  regionSnapshots[region] = {
    ...req.body,
    receivedAt: new Date().toISOString(),
  };

  res.status(200).json({ success: true });
});

/**
 * Fetch latest data for a specific region
 * Example: GET /data/rooms/room1
 */
app.get("/data/:region", (req, res) => {
  const { region } = req.params;

  const snapshot = regionSnapshots[region];

  if (!snapshot) {
    return res.status(200).json({
      message: `No data received yet for ${region}`,
    });
  }

  res.status(200).json(snapshot);
});

/**
 * Health check endpoint
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
