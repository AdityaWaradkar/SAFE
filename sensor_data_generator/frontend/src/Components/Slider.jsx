import React from "react";

const PARAMETERS = [
  {
    key: "flame",
    label: "Flame",
    unit: "%",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: "smoke",
    label: "Smoke",
    unit: "%",
    min: 0,
    max: 100,
    step: 1,
  },
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
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
        Parameter Adjustments
      </h2>

      <div className="space-y-8">
        {PARAMETERS.map((param, index) => {
          const displayValue =
            param.key === "temperature"
              ? Number(values[index]).toFixed(2)
              : values[index];

          return (
            <div key={param.key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-700 font-medium text-sm">
                  {param.label}
                </label>

                <span className="text-blue-600 font-mono font-semibold bg-blue-50 px-2 py-1 rounded text-xs">
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
                className="
                  w-full h-2 rounded-full cursor-pointer
                  bg-slate-200 appearance-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  accent-blue-600
                "
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
