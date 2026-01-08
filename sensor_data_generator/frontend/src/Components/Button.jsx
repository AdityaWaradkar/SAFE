import React from "react";

export default function Button({ items, active, onSelect, title }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      {title && (
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {items.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              aria-pressed={isActive}
              className={[
                "py-3 px-4 rounded-lg text-sm font-medium",
                "transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                isActive
                  ? "bg-blue-600 text-white shadow focus:ring-blue-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-300",
              ].join(" ")}
            >
              {formatLabel(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatLabel(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
