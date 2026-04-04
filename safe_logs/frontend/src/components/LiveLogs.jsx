import { useEffect, useState } from "react";
import { connectWebSocket } from "../services/websocket";

export default function LiveLogs({ onNewLog }) {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const ws = connectWebSocket((msg) => {
      if (msg.type === "NEW_LOG") {
        onNewLog(msg.data);
        setStatus("Live"); // update when data comes
      }
    });

    // fallback: if no data
    const timeout = setTimeout(() => {
      setStatus("Waiting...");
    }, 3000);

    return () => {
      clearTimeout(timeout);
      ws.close();
      setStatus("Disconnected");
    };
  }, []);

  return (
    <div className="bg-slate-900 p-4 rounded-xl shadow flex justify-between items-center">
      <h2 className="text-lg font-semibold">Live Stream</h2>

      <span
        className={`px-3 py-1 rounded-full text-sm ${
          status === "Live"
            ? "bg-green-600"
            : status === "Disconnected"
              ? "bg-red-600"
              : "bg-yellow-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
