export default function LogsTable({ logs }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Logs</h2>

      <div className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr>
              <th className="p-2 text-left">System</th>
              <th className="p-2 text-left">Mode</th>
              <th className="p-2 text-left">Floor</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Path</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log, index) => {
              const mode = log.system_mode || log.systemMode;

              return (
                <tr
                  key={index}
                  className="border-b border-slate-700 hover:bg-slate-800 transition"
                >
                  <td className="p-2">{log.system_id || log.systemId}</td>

                  <td
                    className={`p-2 font-semibold ${
                      mode === "ACTIVE" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {mode}
                  </td>

                  <td className="p-2">{log.floor_id || log.floorId}</td>

                  <td className="p-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="p-2">
                    {log.evacuation?.active_path_id ||
                      log.activeEvacuationPathId}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
