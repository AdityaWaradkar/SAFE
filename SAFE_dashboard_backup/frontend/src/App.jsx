import Header from "./components/Header";
import StatusPanel from "./components/StatusPanel";
import Legend from "./components/Legend";
import MapPlaceholder from "./components/MapPlaceholder";
import EmergencyBanner from "./components/EmergencyBanner";

export default function App() {
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <div className="px-4 pt-4 shrink-0">
        <div className="max-w-[1600px] mx-auto">
          <Header />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 px-4 py-4 overflow-hidden">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
            {/* LEFT SIDEBAR */}
            <div className="space-y-4">
              <StatusPanel />
              <Legend />
            </div>

            {/* RIGHT MAP AREA */}
            <div className="flex flex-col gap-3">
              <MapPlaceholder />

              <div className="bg-white shadow rounded-md px-4 py-2 text-sm flex flex-wrap justify-between gap-3">
                <span>🔥 Fire</span>
                <span>☁️ Smoke</span>
                <span>🌡️ High Temp</span>
                <span>🟩 Safe Exit</span>
                <span>➖ Evacuation Route</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY BANNER */}
      <div className="shrink-0">
        <EmergencyBanner />
      </div>
    </div>
  );
}
