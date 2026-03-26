import { Flame, Wind, Thermometer, Users } from "lucide-react";

export default function NodeTooltip({ nodeId, data, position }) {
  // Handle case when data is null or undefined
  if (!data || !Array.isArray(data) || data.length < 4) {
    return (
      <div
        className="absolute z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 min-w-[180px] pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700" />
        <div className="text-xs font-semibold mb-2 text-slate-900 dark:text-slate-100">
          {nodeId}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          No sensor data available
        </div>
      </div>
    );
  }

  const [flame, smoke, temperature, people] = data;

  const getStatusColor = (value, type) => {
    if (type === "flame") return value > 0 ? "text-red-500" : "text-green-500";
    if (type === "smoke")
      return value > 30 ? "text-orange-500" : "text-green-500";
    if (type === "temperature")
      return value > 45
        ? "text-red-500"
        : value > 35
          ? "text-orange-500"
          : "text-green-500";
    return "text-slate-700";
  };

  return (
    <div
      className="absolute z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 min-w-[180px] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      {/* Arrow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700" />

      <div className="text-xs font-semibold mb-2 text-slate-900 dark:text-slate-100">
        {nodeId}
      </div>

      <div className="space-y-2">
        {/* Flame */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Flame size={12} className={getStatusColor(flame, "flame")} />
            <span className="text-slate-600 dark:text-slate-400">Flame</span>
          </div>
          <span className={`font-medium ${getStatusColor(flame, "flame")}`}>
            {flame > 0 ? "DETECTED" : "None"}
          </span>
        </div>

        {/* Smoke */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Wind size={12} className={getStatusColor(smoke, "smoke")} />
            <span className="text-slate-600 dark:text-slate-400">Smoke</span>
          </div>
          <span className={`font-medium ${getStatusColor(smoke, "smoke")}`}>
            {smoke}%
          </span>
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Thermometer
              size={12}
              className={getStatusColor(temperature, "temperature")}
            />
            <span className="text-slate-600 dark:text-slate-400">Temp</span>
          </div>
          <span
            className={`font-medium ${getStatusColor(temperature, "temperature")}`}
          >
            {temperature}°C
          </span>
        </div>

        {/* People */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <Users size={12} className="text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400">People</span>
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {people}
          </span>
        </div>
      </div>
    </div>
  );
}
