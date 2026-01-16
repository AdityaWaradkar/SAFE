export default function EventTimer({ emergency }) {
  return (
    <div
      className={`rounded-2xl p-6 text-white flex flex-col items-center justify-center
        ${
          emergency
            ? "bg-gradient-to-br from-red-700 to-red-900"
            : "bg-gradient-to-br from-emerald-600 to-teal-800"
        }`}
    >
      <p className="text-xs uppercase tracking-widest opacity-80">
        Event Timer
      </p>

      <div className="text-6xl font-mono font-bold my-2">00:00:00</div>

      <div className="px-4 py-1.5 rounded-full bg-black/20 text-sm font-bold">
        {emergency ? "STATUS: CRITICAL ALERT" : "STATUS: ACTIVE MONITORING"}
      </div>
    </div>
  );
}
