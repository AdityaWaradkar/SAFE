export const connectWebSocket = (onMessage) => {
  let ws;

  const connect = () => {
    ws = new WebSocket("ws://localhost:8081");

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected. Reconnecting...");
      setTimeout(connect, 2000); // auto reconnect
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };
  };

  connect();

  return {
    close: () => ws && ws.close(),
  };
};
