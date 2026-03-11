import {
  Flame,
  Wind,
  Thermometer,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function SensorCard({
  name,
  temperature = 0,
  smoke = 0,
  flame = 0,
  people_count = 0,
}) {
  // Determine risk level based on sensor values
  const getRiskLevel = () => {
    if (flame > 0) return "critical";
    if (smoke > 30) return "warning";
    if (temperature > 45) return "warning";
    if (temperature > 35) return "caution";
    return "safe";
  };

  const level = getRiskLevel();

  const styles = {
    safe: {
      border: "border-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle,
    },
    caution: {
      border: "border-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      text: "text-yellow-700 dark:text-yellow-400",
      icon: AlertTriangle,
    },
    warning: {
      border: "border-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      text: "text-orange-700 dark:text-orange-400",
      icon: AlertTriangle,
    },
    critical: {
      border: "border-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
      text: "text-red-700 dark:text-red-400",
      icon: Flame,
    },
  };

  const currentStyle = styles[level];
  const StatusIcon = currentStyle.icon;

  // Get status text
  const getStatusText = () => {
    if (flame > 0) return "FIRE DETECTED!";
    if (smoke > 30) return "High Smoke";
    if (temperature > 45) return "Critical Heat";
    if (temperature > 35) return "Elevated Heat";
    return "Normal";
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${currentStyle.border} ${currentStyle.bg} 
        bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 
        transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {name}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentStyle.text} bg-white dark:bg-slate-800`}
          >
            {getStatusText()}
          </span>
        </div>
        <StatusIcon size={18} className={currentStyle.text} />
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Flame */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame
              size={14}
              className={flame > 0 ? "text-red-500" : "text-slate-400"}
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Flame
            </span>
          </div>
          <p
            className={`text-sm font-semibold ${flame > 0 ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}
          >
            {flame > 0 ? "YES" : "NO"}
          </p>
        </div>

        {/* Smoke */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wind
              size={14}
              className={smoke > 30 ? "text-orange-500" : "text-slate-400"}
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Smoke
            </span>
          </div>
          <p
            className={`text-sm font-semibold ${smoke > 30 ? "text-orange-500" : "text-slate-700 dark:text-slate-300"}`}
          >
            {smoke}%
          </p>
        </div>

        {/* Temperature */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Thermometer
              size={14}
              className={
                temperature > 35 ? "text-orange-500" : "text-slate-400"
              }
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Temp
            </span>
          </div>
          <p
            className={`text-sm font-semibold ${temperature > 35 ? "text-orange-500" : "text-slate-700 dark:text-slate-300"}`}
          >
            {temperature}°C
          </p>
        </div>

        {/* People */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              People
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {people_count}
          </p>
        </div>
      </div>

      {/* Progress bar for smoke/temperature (visual indicator) */}
      {(smoke > 0 || temperature > 20) && (
        <div className="mt-3 space-y-2">
          {smoke > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Smoke Level</span>
                <span
                  className={
                    smoke > 30
                      ? "text-orange-500 font-medium"
                      : "text-slate-600"
                  }
                >
                  {smoke}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(smoke, 100)}%` }}
                />
              </div>
            </div>
          )}

          {temperature > 20 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Temperature</span>
                <span
                  className={
                    temperature > 35
                      ? "text-orange-500 font-medium"
                      : "text-slate-600"
                  }
                >
                  {temperature}°C
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    temperature > 45
                      ? "bg-red-500"
                      : temperature > 35
                        ? "bg-orange-500"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min((temperature / 50) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
