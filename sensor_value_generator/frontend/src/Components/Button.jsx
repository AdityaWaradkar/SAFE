import React from "react";

export default function Button({ items, active, onSelect, title }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {title && (
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          {title}
        </h2>
      )}

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
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
