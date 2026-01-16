import { ShieldCheck, Flame, Thermometer } from "lucide-react";

export default function SensorCard({ name, status, temp, smoke }) {
  const level =
    status === "Fire Detected"
      ? "critical"
      : smoke > 50 || temp > 50
      ? "warning"
      : "safe";

  const styles = {
    safe: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    warning: "border-orange-500 text-orange-600 dark:text-orange-400",
    critical: "border-red-500 text-red-600 dark:text-red-400",
  };

  return (
    <div
      className={`p-5 rounded-xl bg-white dark:bg-bg-card border border-slate-200 dark:border-slate-800 border-l-4 transition-colors ${styles[level]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            {name}
          </h3>
          <p className={`text-xs font-mono mt-1 ${styles[level]}`}>
            {status.toUpperCase()}
          </p>
        </div>
        {level === "critical" ? (
          <Flame />
        ) : level === "warning" ? (
          <Thermometer />
        ) : (
          <ShieldCheck />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] uppercase text-slate-400">Temp</span>
          <div className="text-lg font-mono text-slate-700 dark:text-slate-200">
            {temp}°C
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-400">Smoke</span>
          <div className="text-lg font-mono text-slate-700 dark:text-slate-200">
            {smoke}%
          </div>
        </div>
      </div>
    </div>
  );
}
