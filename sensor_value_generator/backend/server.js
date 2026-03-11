import express from "express";
import cors from "cors";

const app = express();

// Server configuration
const PORT = process.env.PORT || 5000;
const DATA_TIMEOUT_MS = 15000;

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  "http://192.168.4.1",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://safe-rho-ivory.vercel.app",
];

// Enable CORS for allowed origins
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));

// In-memory telemetry state
let nodesSnapshot = null;
let lastUpdateTime = null;

// Update timestamp when new data arrives
function markUpdated() {
  lastUpdateTime = Date.now();
}

// Check if telemetry data has timed out
function isTimedOut() {
  if (!lastUpdateTime) {
    return false;
  }

  return Date.now() - lastUpdateTime > DATA_TIMEOUT_MS;
}

// Receive telemetry payload from sensor generator
app.post("/data/nodes", (req, res) => {
  try {
    nodesSnapshot = {
      ...req.body,
      receivedAt: new Date().toISOString(),
    };

    markUpdated();

    console.log(
      `[${new Date().toISOString()}] Telemetry received | systemId: ${
        req.body.systemId || "unknown"
      }`,
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating nodes:", err);
    res.status(500).json({ success: false });
  }
});

// Return latest telemetry snapshot
app.get("/data/nodes", (_req, res) => {
  if (!nodesSnapshot) {
    return res.json({ message: "No nodes data received yet" });
  }

  res.json(nodesSnapshot);
});

// Endpoint used by ESP controller to fetch system state
app.get("/state", (_req, res) => {
  if (isTimedOut()) {
    console.warn(
      `[${new Date().toISOString()}] Data timeout — serving last known state`,
    );
  }

  res.json({
    nodes: nodesSnapshot,
    timedOut: isTimedOut(),
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
  });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hasData: !!nodesSnapshot,
    timedOut: isTimedOut(),
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
    uptimeSeconds: process.uptime(),
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start backend server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`SAFE backend running on port ${PORT}`);
});
