import { useState, useEffect } from "react";
import DashboardHeader from "./components/header/DashboardHeader";
import LiveSensorsPanel from "./components/sensors/LiveSensorsPanel";
import PhysicalLayout from "./components/layout/PhysicalLayout";
import EventTimer from "./components/status/EventTimer";
import SystemLogs from "./components/logs/SystemLogs";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [emergency, setEmergency] = useState(false);

  // CRITICAL: This effect applies the dark class to the HTML root
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-100 dark:bg-bg-main text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <DashboardHeader
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          emergency={emergency}
          setEmergency={setEmergency}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <LiveSensorsPanel emergency={emergency} />
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <PhysicalLayout emergency={emergency} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EventTimer emergency={emergency} />
              <SystemLogs emergency={emergency} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
