import React from "react";

const Button = ({ regions, activeRegion, onSelect }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Region Selector
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {regions.map((region) => {
          const isActive = activeRegion === region;

          return (
            <button
              key={region}
              onClick={() => onSelect(region)}
              aria-pressed={isActive}
              className={[
                "relative py-3 px-4 rounded-lg text-sm font-medium",
                "transition-all duration-150 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                isActive
                  ? "bg-blue-600 text-white shadow focus:ring-blue-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-300",
              ].join(" ")}
            >
              {region.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Button;
