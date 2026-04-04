import { useEffect, useState } from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import LiveLogs from "./components/LiveLogs";
import LogsTable from "./components/LogsTable";
import { fetchLogs } from "./services/api";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchLogs();
    setLogs(data);
    setLoading(false);
  };

  const addLiveLog = (log) => {
    setLogs((prev) => [log, ...prev.slice(0, 199)]); // keep max 200 logs
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />

        <Controls reload={loadLogs} />

        <LiveLogs onNewLog={addLiveLog} />

        {loading ? (
          <div className="text-center text-gray-400">Loading logs...</div>
        ) : (
          <LogsTable logs={logs} />
        )}
      </div>
    </div>
  );
}
