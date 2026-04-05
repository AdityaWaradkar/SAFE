import React from "react";

// Threshold definitions for color coding (based on algorithm)
const THRESHOLDS = {
  flame: {
    safe: { max: 0, color: "green" },
    low: { min: 1, max: 10, color: "lime" },
    medium: { min: 10, max: 20, color: "yellow" },
    high: { min: 20, max: 40, color: "orange" },
    blocked: { min: 40, max: 100, color: "red" },
  },
  smoke: {
    safe: { max: 10, color: "green" },
    low: { min: 10, max: 20, color: "lime" },
    medium: { min: 20, max: 40, color: "yellow" },
    high: { min: 40, max: 60, color: "orange" },
    blocked: { min: 60, max: 100, color: "red" },
  },
  temperature: {
    safe: { max: 45, color: "green" },
    low: { min: 45, max: 50, color: "lime" },
    medium: { min: 50, max: 55, color: "yellow" },
    high: { min: 55, max: 60, color: "orange" },
    blocked: { min: 60, max: 120, color: "red" },
  },
  people: {
    low: { max: 5, color: "green" },
    moderate: { min: 5, max: 10, color: "lime" },
    crowded: { min: 10, max: 15, color: "yellow" },
    veryCrowded: { min: 15, max: 20, color: "orange" },
    critical: { min: 20, color: "red" },
  },
};

// Get color based on value and sensor type
const getSliderColor = (sensorType, value) => {
  const thresholds = THRESHOLDS[sensorType];
  if (!thresholds) return "blue";

  for (const [zone, config] of Object.entries(thresholds)) {
    if (config.min !== undefined && value < config.min) continue;
    if (config.max !== undefined && value > config.max) continue;
    if (
      config.min !== undefined &&
      config.max !== undefined &&
      value >= config.min &&
      value <= config.max
    ) {
      return config.color;
    }
    if (config.max !== undefined && value <= config.max) return config.color;
    if (config.min !== undefined && value >= config.min) return config.color;
  }
  return "blue";
};

// Get status text for tooltip/display
const getStatusText = (sensorType, value) => {
  const thresholds = THRESHOLDS[sensorType];
  if (!thresholds) return "";

  for (const [zone, config] of Object.entries(thresholds)) {
    if (config.min !== undefined && value < config.min) continue;
    if (config.max !== undefined && value > config.max) continue;
    if (
      config.min !== undefined &&
      config.max !== undefined &&
      value >= config.min &&
      value <= config.max
    ) {
      return zone.toUpperCase();
    }
    if (config.max !== undefined && value <= config.max)
      return zone.toUpperCase();
    if (config.min !== undefined && value >= config.min)
      return zone.toUpperCase();
  }
  return "";
};

const PARAMETERS = [
  { key: "flame", label: "Flame", unit: "%", min: 0, max: 100, step: 1 },
  { key: "smoke", label: "Smoke", unit: "%", min: 0, max: 100, step: 1 },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: 20,
    max: 120,
    step: 0.5,
  },
  {
    key: "people",
    label: "People Count",
    unit: "persons",
    min: 0,
    max: 30,
    step: 1,
  },
];

export default function Slider({ values, onChange, nodeId }) {
  // Get color for a specific slider
  const getColorForSlider = (paramKey, value) => {
    if (paramKey === "flame") return getSliderColor("flame", value);
    if (paramKey === "smoke") return getSliderColor("smoke", value);
    if (paramKey === "temperature") return getSliderColor("temperature", value);
    if (paramKey === "people") return getSliderColor("people", value);
    return "blue";
  };

  // Get the CSS class for the slider thumb
  const getSliderClass = (color) => {
    const colorMap = {
      green: "accent-emerald-500",
      lime: "accent-lime-500",
      yellow: "accent-yellow-500",
      orange: "accent-orange-500",
      red: "accent-red-600",
      blue: "accent-blue-600",
    };
    return colorMap[color] || "accent-blue-600";
  };

  // Get background style for slider track
  const getTrackStyle = (paramKey, value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const color = getColorForSlider(paramKey, value);

    const colorHex =
      {
        green: "#10b981",
        lime: "#84cc16",
        yellow: "#eab308",
        orange: "#f97316",
        red: "#dc2626",
        blue: "#3b82f6",
      }[color] || "#3b82f6";

    return {
      background: `linear-gradient(to right, ${colorHex} 0%, ${colorHex} ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
    };
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Parameter Adjustments
        </h2>
        <span className="text-xs text-slate-400">Node: {nodeId}</span>
      </div>

      {/* Color Legend */}
      <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          Risk Legend:
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-lime-500"></span> Low Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium
            Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span> High
            Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Blocked /
            Critical
          </span>
        </div>
      </div>

      <div className="space-y-7">
        {PARAMETERS.map((param, index) => {
          const value = values[index];
          const color = getColorForSlider(param.key, value);
          const status = getStatusText(param.key, value);

          return (
            <div key={param.key}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {param.label}
                  </label>
                  {status && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        color === "green"
                          ? "bg-emerald-100 text-emerald-700"
                          : color === "lime"
                            ? "bg-lime-100 text-lime-700"
                            : color === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : color === "orange"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                <span
                  className={`text-xs font-mono font-semibold px-2 py-1 rounded ${
                    color === "green"
                      ? "bg-emerald-100 text-emerald-700"
                      : color === "lime"
                        ? "bg-lime-100 text-lime-700"
                        : color === "yellow"
                          ? "bg-yellow-100 text-yellow-700"
                          : color === "orange"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                  }`}
                >
                  {param.key === "temperature" ? value.toFixed(1) : value}{" "}
                  {param.unit}
                </span>
              </div>

              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={value}
                onChange={(e) => onChange(index, Number(e.target.value))}
                className={`w-full h-2 rounded-full cursor-pointer ${getSliderClass(color)}`}
                style={getTrackStyle(param.key, value, param.min, param.max)}
              />

              {/* Threshold markers */}
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500 px-1">
                {param.key === "temperature" && (
                  <>
                    <span>20</span>
                    <span>45°</span>
                    <span>50°</span>
                    <span>55°</span>
                    <span>60°</span>
                    <span>120</span>
                  </>
                )}
                {param.key === "flame" && (
                  <>
                    <span>0</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>40%</span>
                    <span>100</span>
                  </>
                )}
                {param.key === "smoke" && (
                  <>
                    <span>0</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>40%</span>
                    <span>60%</span>
                    <span>100</span>
                  </>
                )}
                {param.key === "people" && (
                  <>
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                    <span>30</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Threshold Guidance Note */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          <span className="font-medium">Note:</span> Values in{" "}
          <span className="text-red-500">RED</span> indicate blocked nodes.
          Values in <span className="text-orange-500">ORANGE/YELLOW</span>{" "}
          indicate increasing risk. Algorithm will avoid routing through
          high-risk areas.
        </p>
      </div>
    </div>
  );
}
