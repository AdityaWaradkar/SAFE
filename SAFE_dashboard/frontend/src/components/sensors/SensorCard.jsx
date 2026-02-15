import { ShieldCheck, Flame, Thermometer, Users } from "lucide-react";

export default function SensorCard({
  name,
  temperature,
  smoke,
  flame,
  people_count,
}) {
  const level =
    flame > 0 || temperature >= 80 || smoke >= 70
      ? "critical"
      : temperature >= 50 || smoke >= 40
      ? "warning"
      : "safe";

  const styles = {
    safe: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    warning: "border-orange-500 text-orange-600 dark:text-orange-400",
    critical: "border-red-500 text-red-600 dark:text-red-400",
  };

  const statusText = {
    safe: "SAFE",
    warning: "WARNING",
    critical: "CRITICAL",
  };

  const Icon =
    level === "critical"
      ? Flame
      : level === "warning"
      ? Thermometer
      : ShieldCheck;

  return (
    <div
      className={`p-5 rounded-xl bg-white dark:bg-bg-card border border-slate-200 dark:border-slate-800 border-l-4 ${styles[level]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className={`text-xs font-mono mt-1 ${styles[level]}`}>
            {statusText[level]}
          </p>
        </div>
        <Icon />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="block text-[10px] uppercase text-slate-400">
            Temp
          </span>
          <span className="font-mono">{temperature}°C</span>
        </div>

        <div>
          <span className="block text-[10px] uppercase text-slate-400">
            Smoke
          </span>
          <span className="font-mono">{smoke}%</span>
        </div>

        <div>
          <span className="block text-[10px] uppercase text-slate-400">
            People
          </span>
          <span className="font-mono flex items-center gap-1">
            <Users size={12} />
            {people_count}
          </span>
        </div>
      </div>
    </div>
  );
}
