import express from "express";
import cors from "cors";

const app = express();

/**
 * Use Render port if available, else default to 5000
 */
const PORT = process.env.PORT || 5000;

/**
 * Allow specific origins (adjust as needed)
 */
const allowedOrigins = [
  "http://192.168.4.1",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://safe-rho-ivory.vercel.app/", // <-- replace with your real frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());

/**
 * ----------------------------------------
 * CONFIG
 * ----------------------------------------
 */

/**
 * Timeout (fail-safe)
 * If no update in 15 seconds, ESP still receives last known data
 */
const DATA_TIMEOUT_MS = 15000;

/**
 * ----------------------------------------
 * In-memory snapshot
 * ----------------------------------------
 */
let nodesSnapshot = null;
let lastUpdateTime = null;

/**
 * Mark last update time
 */
function markUpdated() {
  lastUpdateTime = Date.now();
}

/**
 * Utility: Check timeout
 */
function isTimedOut() {
  if (!lastUpdateTime) return false;
  return Date.now() - lastUpdateTime > DATA_TIMEOUT_MS;
}

/**
 * ----------------------------------------
 * NODES ENDPOINT
 * ----------------------------------------
 */

app.post("/data/nodes", (req, res) => {
  try {
    nodesSnapshot = {
      ...req.body,
      receivedAt: new Date().toISOString(),
    };

    markUpdated();

    console.log(
      `[${new Date().toISOString()}] Nodes updated | systemId: ${
        req.body.systemId || "unknown"
      }`,
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating nodes:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/data/nodes", (_req, res) => {
  if (!nodesSnapshot) {
    return res.json({ message: "No nodes data received yet" });
  }

  res.json(nodesSnapshot);
});

/**
 * ----------------------------------------
 * MERGED STATE (FOR ESP)
 * ----------------------------------------
 */

app.get("/state", (_req, res) => {
  if (isTimedOut()) {
    console.warn(
      `[${new Date().toISOString()}] ⚠ Data timeout — serving last known state`,
    );
  }

  res.json({
    nodes: nodesSnapshot,
    timedOut: isTimedOut(),
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
  });
});

/**
 * ----------------------------------------
 * HEALTH CHECK
 * ----------------------------------------
 */

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hasData: !!nodesSnapshot,
    timedOut: isTimedOut(),
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
    uptimeSeconds: process.uptime(),
  });
});

/**
 * ----------------------------------------
 * GLOBAL ERROR HANDLER
 * ----------------------------------------
 */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

/**
 * ----------------------------------------
 * START SERVER
 * ----------------------------------------
 *
 * For LAN (RPi): binds to 0.0.0.0
 * For Render: host binding is ignored automatically
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`SAFE backend running on port ${PORT}`);
});
