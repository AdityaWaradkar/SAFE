import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function PhysicalLayout({ emergency }) {
  return (
    <div className="relative h-[420px] rounded-3xl bg-white dark:bg-bg-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-center">
          <ShieldCheck size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="font-bold tracking-widest text-slate-800 dark:text-slate-200">
            PHYSICAL LAYOUT VIEW
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Waiting for Model Integration...
          </p>
        </div>

        {emergency && (
          <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse flex gap-2 items-center shadow-lg">
            <AlertTriangle size={18} /> FIRE CONFIRMED
          </div>
        )}
      </div>
    </div>
  );
}
