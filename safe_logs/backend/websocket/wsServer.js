import { WebSocketServer } from "ws";

let wss;

export const initWebSocket = (port) => {
  wss = new WebSocketServer({ port });

  console.log(`✅ WebSocket running on port ${port}`);

  wss.on("connection", (ws) => {
    console.log("🔌 Client connected");

    ws.on("close", () => {
      console.log("❌ Client disconnected");
    });
  });
};

export const broadcast = (data) => {
  if (!wss) return;

  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};
