import React from "react";

const PARAMETERS = [
  { key: "flame", label: "Flame", unit: "%", min: 0, max: 100, step: 1 },
  { key: "smoke", label: "Smoke", unit: "%", min: 0, max: 100, step: 1 },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: 20,
    max: 120,
    step: 0.01,
  },
  {
    key: "people",
    label: "People Count",
    unit: "persons",
    min: 0,
    max: 20,
    step: 1,
  },
];

export default function Slider({ values, onChange }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-6">
        Parameter Adjustments
      </h2>

      <div className="space-y-7">
        {PARAMETERS.map((param, index) => {
          const displayValue =
            param.key === "temperature"
              ? Number(values[index]).toFixed(2)
              : values[index];

          return (
            <div key={param.key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {param.label}
                </label>

                <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {displayValue} {param.unit}
                </span>
              </div>

              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[index]}
                onChange={(e) => onChange(index, Number(e.target.value))}
                className="w-full h-2 rounded-full cursor-pointer bg-slate-200 dark:bg-slate-700 accent-blue-600"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
