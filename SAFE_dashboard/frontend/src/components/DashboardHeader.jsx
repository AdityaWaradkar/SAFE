import { Sun, Moon, Activity, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardHeader({
  darkMode,
  setDarkMode,
  systemMode,
  lastUpdate,
}) {
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const seconds = Math.floor((new Date() - new Date(lastUpdate)) / 1000);

      if (seconds < 5) {
        setTimeAgo("just now");
        setConnectionStatus("connected");
      } else if (seconds < 10) {
        setTimeAgo(`${seconds} seconds ago`);
        setConnectionStatus("connected");
      } else {
        setTimeAgo(`${seconds} seconds ago`);
        setConnectionStatus("delayed");
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const modeText = systemMode === "ACTIVE" ? "Active • Monitoring" : "Idle";

  const statusColor =
    systemMode === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400";

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            SAFE
            <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
              DASHBOARD
            </span>
          </h1>

          {/* Status badge */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`w-2 h-2 rounded-full ${statusColor} ${systemMode === "ACTIVE" ? "animate-pulse" : ""}`}
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {modeText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Emergency Evacuation Management System
          </p>

          {/* Connection status */}
          <div className="flex items-center gap-1 text-xs">
            {connectionStatus === "connected" ? (
              <>
                <Wifi size={12} className="text-emerald-500" />
                <span className="text-slate-500">Connected {timeAgo}</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-orange-500" />
                <span className="text-orange-500">Delayed {timeAgo}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Dark mode toggle with animation */}
        <button
          aria-label="Toggle Dark Mode"
          onClick={() => setDarkMode(!darkMode)}
          className="relative p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
            transition-all duration-300 hover:scale-105 hover:shadow-md group"
        >
          <div
            className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-purple-500/0 
            group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300`}
          />
          {darkMode ? (
            <Sun
              size={18}
              className="text-amber-500 transition-transform duration-300 hover:rotate-90"
            />
          ) : (
            <Moon
              size={18}
              className="text-slate-700 transition-transform duration-300 hover:-rotate-12"
            />
          )}
        </button>

        {/* Quick actions could go here */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="text-xs text-slate-400">v2.0.0</div>
      </div>
    </header>
  );
}
