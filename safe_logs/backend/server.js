import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import logsRoutes from "./routes/logs.routes.js";
import { initWebSocket } from "./websocket/wsServer.js";
import { startPolling } from "./services/pollerService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/logs", logsRoutes);

app.get("/", (req, res) => {
  res.send("SAFE Backend Running 🚀");
});

const PORT = process.env.PORT || 5100;
const WS_PORT = process.env.WS_PORT || 8081;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  initWebSocket(WS_PORT);
  startPolling();
});
