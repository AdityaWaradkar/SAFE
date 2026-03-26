import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Map,
  ArrowRight,
  GitBranch,
  Target,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export default function SystemLogs({
  timestamp,
  systemMode,
  activeAlerts = 0,
  paths = {},
}) {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedPath, setExpandedPath] = useState(null);

  // Memoize path statistics with null checks
  const pathStats = useMemo(() => {
    if (
      !paths ||
      typeof paths !== "object" ||
      Object.keys(paths).length === 0
    ) {
      return { total: 0, longest: 0, shortest: 0 };
    }

    // Filter out null paths and get valid arrays
    const validPaths = Object.values(paths).filter(
      (path) => Array.isArray(path) && path.length > 0,
    );

    if (validPaths.length === 0) {
      return { total: 0, longest: 0, shortest: 0 };
    }

    const pathLengths = validPaths.map((path) => path.length);
    return {
      total: validPaths.length,
      longest: Math.max(...pathLengths),
      shortest: Math.min(...pathLengths),
    };
  }, [paths]);

  // Memoize formatted time
  const formattedTime = useMemo(() => {
    return timestamp
      ? new Date(timestamp).toLocaleTimeString()
      : "Waiting for data";
  }, [timestamp]);

  const formattedDate = useMemo(() => {
    return timestamp ? new Date(timestamp).toLocaleDateString() : "";
  }, [timestamp]);

  // Generate initial logs
  useEffect(() => {
    const newLogs = [
      {
        id: 1,
        time: new Date(Date.now() - 5000).toLocaleTimeString(),
        message: "System initialized",
        type: "info",
      },
      {
        id: 2,
        time: new Date(Date.now() - 3000).toLocaleTimeString(),
        message: "Connected to sensor network",
        type: "success",
      },
    ];

    if (systemMode === "ACTIVE") {
      newLogs.push({
        id: 3,
        time: new Date(Date.now() - 1000).toLocaleTimeString(),
        message: "Active evacuation mode - monitoring paths",
        type: "warning",
      });
    }

    // Add path calculation logs with null checks
    if (paths && typeof paths === "object") {
      const validPathCount = Object.values(paths).filter(
        (path) => Array.isArray(path) && path.length > 0,
      ).length;

      if (validPathCount > 0) {
        newLogs.push({
          id: Date.now() - 500,
          time: new Date().toLocaleTimeString(),
          message: `A* algorithm computed ${validPathCount} evacuation paths`,
          type: "success",
        });

        // Add log for each valid source node (limit to 5)
        let counter = 0;
        Object.entries(paths).forEach(([sourceNode, path], idx) => {
          if (Array.isArray(path) && path.length > 0 && counter < 5) {
            newLogs.push({
              id: Date.now() - 400 + idx,
              time: new Date().toLocaleTimeString(),
              message: `Path found from ${sourceNode} to ${path[path.length - 1]} (${path.length} nodes)`,
              type: "info",
            });
            counter++;
          }
        });

        // If there are more than 5 valid paths, add a summary
        if (validPathCount > 5) {
          newLogs.push({
            id: Date.now() - 350,
            time: new Date().toLocaleTimeString(),
            message: `... and ${validPathCount - 5} more paths`,
            type: "info",
          });
        }
      }
    }

    setLogs(newLogs);
  }, [systemMode, paths]);

  // Add new log when alerts change
  useEffect(() => {
    if (activeAlerts > 0) {
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message: `${activeAlerts} active alert${activeAlerts > 1 ? "s" : ""} detected`,
        type: "error",
      };
      setLogs((prev) => {
        const exists = prev.some(
          (log) => log.message === newLog.message && log.type === newLog.type,
        );
        if (exists) return prev;
        return [newLog, ...prev].slice(0, 50);
      });
    }
  }, [activeAlerts]);

  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={12} className="text-emerald-500" />;
      case "warning":
        return <AlertTriangle size={12} className="text-orange-500" />;
      case "error":
        return <AlertTriangle size={12} className="text-red-500" />;
      default:
        return <Activity size={12} className="text-blue-500" />;
    }
  };

  // Render path visualization with null checks
  const renderPathVisualization = (path, index, sourceNode) => {
    if (!Array.isArray(path) || path.length < 2) return null;

    const startNode = path[0];
    const endNode = path[path.length - 1];
    const pathLength = path.length;

    return (
      <div
        key={sourceNode}
        className="mt-2 mb-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
      >
        {/* Path header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Map size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Evacuation Path from {sourceNode}
            </span>
          </div>
          <button
            onClick={() =>
              setExpandedPath(expandedPath === index ? null : index)
            }
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            {expandedPath === index ? "Show less" : "Show details"}
          </button>
        </div>

        {/* Path summary */}
        <div className="flex items-center gap-3 text-xs mb-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Target size={12} className="text-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">From:</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {startNode}
            </span>
          </div>
          <ArrowRight size={12} className="text-slate-400" />
          <div className="flex items-center gap-1">
            <Target size={12} className="text-red-500" />
            <span className="text-slate-600 dark:text-slate-400">To:</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {endNode}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <GitBranch size={12} className="text-purple-500" />
            <span className="text-slate-600 dark:text-slate-400">
              {pathLength} nodes
            </span>
          </div>
        </div>

        {/* Path visualization */}
        <div className="flex items-center flex-wrap gap-1 mt-2">
          {path.map((node, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`
                px-2 py-1 rounded text-xs font-mono
                ${
                  idx === 0
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : idx === path.length - 1
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }
              `}
              >
                {node}
              </div>
              {idx < path.length - 1 && (
                <ArrowRight size={12} className="mx-1 text-slate-400" />
              )}
            </div>
          ))}
        </div>

        {/* Expanded details */}
        {expandedPath === index && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white dark:bg-slate-900 rounded">
                <div className="text-slate-500 mb-1">Path Segments</div>
                <div className="font-medium">{pathLength - 1} connections</div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded">
                <div className="text-slate-500 mb-1">Exit Reachable</div>
                <div className="font-medium text-emerald-600">Yes</div>
              </div>
            </div>

            {/* Path edges */}
            <div className="text-xs">
              <div className="text-slate-500 mb-1">Path edges:</div>
              <div className="flex flex-wrap gap-2">
                {path.slice(0, -1).map((node, idx) => (
                  <span
                    key={idx}
                    className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                  >
                    {node} → {path[idx + 1]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              System Logs & Path Analysis
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                autoScroll
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              Auto-scroll {autoScroll ? "ON" : "OFF"}
            </button>

            {/* Status indicator */}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  systemMode === "ACTIVE"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              <span className="text-xs text-slate-500">
                {systemMode === "ACTIVE" ? "Live" : "Standby"}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp and Path Stats */}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} />
            <span>
              Last update: {formattedTime} • {formattedDate}
            </span>
          </div>

          {/* Path statistics badges */}
          {pathStats.total > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                <GitBranch size={12} />
                <span>{pathStats.total} paths</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                <Map size={12} />
                <span>Longest: {pathStats.longest}</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                <Target size={12} />
                <span>Shortest: {pathStats.shortest}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logs container with path visualizations */}
      <div
        className="max-h-96 overflow-y-auto p-4 space-y-2 font-mono text-xs"
        ref={(el) => {
          if (el && autoScroll) {
            requestAnimationFrame(() => {
              el.scrollTop = el.scrollHeight;
            });
          }
        }}
      >
        {/* Regular logs */}
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors"
          >
            <span className="text-slate-400 whitespace-nowrap">{log.time}</span>
            <span className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</span>
            <span
              className={`flex-1 ${
                log.type === "error"
                  ? "text-red-600 dark:text-red-400"
                  : log.type === "warning"
                    ? "text-orange-600 dark:text-orange-400"
                    : log.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}

        {/* Path visualizations section */}
        {paths &&
          typeof paths === "object" &&
          Object.keys(paths).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Map size={14} className="text-blue-500" />
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Evacuation Paths (A* Algorithm)
                </h4>
              </div>

              {/* Render all valid paths */}
              {Object.entries(paths).map(([sourceNode, path], index) => {
                if (Array.isArray(path) && path.length > 0) {
                  return renderPathVisualization(path, index, sourceNode);
                }
                return null;
              })}
            </div>
          )}

        {/* Empty state */}
        {logs.length === 0 && (!paths || Object.keys(paths).length === 0) && (
          <div className="flex items-center justify-center h-full text-slate-400">
            No logs or paths available
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-slate-600 dark:text-slate-400">
                Warning
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-400">
                Critical
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">{logs.length} events</span>
            {paths && Object.keys(paths).length > 0 && (
              <span className="text-slate-500">
                {
                  Object.values(paths).filter(
                    (p) => Array.isArray(p) && p.length > 0,
                  ).length
                }{" "}
                active paths
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
