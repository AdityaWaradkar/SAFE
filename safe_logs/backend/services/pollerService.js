import axios from "axios";
import { insertLog } from "./loggerService.js";
import { formatLog } from "../utils/formatter.js";
import { broadcast } from "../websocket/wsServer.js";

export const startPolling = () => {
  setInterval(async () => {
    try {
      const nodeRes = await axios.get("http://localhost:5000/data/nodes");
      const pathRes = await axios.get("http://localhost:7000/paths");

      const formatted = formatLog(nodeRes.data, pathRes.data);

      await insertLog(formatted);

      broadcast({
        type: "NEW_LOG",
        data: formatted,
      });

      console.log("✅ Log stored + broadcasted");
    } catch (err) {
      console.error("❌ Polling error:", err.message);
    }
  }, 2000);
};
