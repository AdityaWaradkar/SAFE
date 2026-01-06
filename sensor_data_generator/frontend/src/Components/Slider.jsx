import React from "react";

const PARAMETERS = [
  {
    label: "Flame",
    unit: "%",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    label: "Smoke",
    unit: "%",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    label: "Temperature",
    unit: "°C",
    min: 20,
    max: 120,
    step: 1,
  },
];

const Slider = ({ values, onChange, scopeId }) => {
  const handleChange = (index) => (e) => {
    onChange(index, Number(e.target.value));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
        Parameter Adjustments
      </h2>

      <div className="space-y-8">
        {PARAMETERS.map((param, index) => (
          <div key={param.label} className="relative">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor={`${scopeId}-${param.label}`}
                className="text-slate-700 font-medium text-sm"
              >
                {param.label}
              </label>

              <span className="text-blue-600 font-mono font-bold bg-blue-50 px-2 py-1 rounded text-xs">
                {values[index]} {param.unit}
              </span>
            </div>

            <input
              id={`${scopeId}-${param.label}`}
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={values[index]}
              onChange={handleChange(index)}
              className="
                w-full h-2 rounded-full appearance-none cursor-pointer
                bg-slate-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                accent-blue-600
              "
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
