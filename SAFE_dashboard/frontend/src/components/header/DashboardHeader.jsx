import { Sun, Moon, Download, AlertTriangle } from "lucide-react";

export default function DashboardHeader({
  darkMode,
  setDarkMode,
  emergency,
  setEmergency,
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight flex gap-3 text-slate-900 dark:text-white">
          SAFE
          <span
            className={`text-sm px-2 py-1 rounded font-semibold self-center
              ${
                emergency
                  ? "bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
          >
            DASHBOARD
          </span>
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${
              emergency ? "bg-red-500 animate-ping" : "bg-emerald-500"
            }`}
          />
          {emergency
            ? "EMERGENCY MODE ACTIVE"
            : "System Online • Connected to Master Node"}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setEmergency(!emergency)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all cursor-pointer
            ${
              emergency
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white animate-pulse"
            }`}
        >
          <AlertTriangle size={18} />
          {emergency ? "Restore Normal" : "Trigger Emergency"}
        </button>

        <button className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
          <Download size={18} />
        </button>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-yellow-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          {darkMode ? (
            <Sun size={20} fill="currentColor" />
          ) : (
            <Moon size={20} fill="currentColor" />
          )}
        </button>
      </div>
    </header>
  );
}
