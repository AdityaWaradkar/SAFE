import { AlertTriangle } from "lucide-react";
import { ReactSVG } from "react-svg";
import layout from "../../assets/layout_v1.svg";

export default function PhysicalLayout({ emergency }) {
  return (
    <div className="relative h-[500px] rounded-3xl bg-white dark:bg-bg-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* SVG Container */}
      <div className="absolute inset-0 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <ReactSVG
            src={layout}
            beforeInjection={(svg) => {
              svg.setAttribute("width", "100%");
              svg.setAttribute("height", "100%");
              svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

              // 🔥 Zoom in
              svg.style.transform = "scale(1.8)";
              svg.style.transformOrigin = "center";

              svg.querySelectorAll("line, path, polyline").forEach((el) => {
                el.style.strokeWidth = "1.5";
              });
            }}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Emergency Badge */}
      {emergency && (
        <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse flex gap-2 items-center shadow-lg">
          <AlertTriangle size={18} /> FIRE CONFIRMED
        </div>
      )}
    </div>
  );
}
