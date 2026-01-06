import express from "express";
import cors from "cors";

const app = express();

// Server configuration
const PORT = process.env.PORT || 3000;

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  "https://safe-rho-ivory.vercel.app",
  "http://localhost:5173",
];

// In-memory store for latest region snapshots
const regionSnapshots = {};

// Enable CORS
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  })
);

// Parse JSON bodies
app.use(express.json());

// Store data for a specific region
app.post("/data/:region", (req, res) => {
  const { region } = req.params;

  // Validate payload
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  regionSnapshots[region] = {
    ...req.body,
    receivedAt: new Date().toISOString(),
  };

  res.status(200).json({ success: true });
});

// Fetch latest data for a specific region
app.get("/data/:region", (req, res) => {
  const { region } = req.params;

  if (!regionSnapshots[region]) {
    return res.status(200).json({
      message: `No data received yet for ${region}`,
    });
  }

  res.status(200).json(regionSnapshots[region]);
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
