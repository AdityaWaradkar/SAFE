import React from "react";

export default function Button({ items, active, onSelect, title }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {title && (
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          {title}
        </h2>
      )}

      <div className="flex flex-wrap gap-3">
        {items.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
