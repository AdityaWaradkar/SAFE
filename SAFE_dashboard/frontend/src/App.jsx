import { useState, useEffect } from "react";
import {
  Users,
  Radio,
  AlertTriangle,
  Map,
  Activity,
  Thermometer,
  Wind,
  Flame,
  Clock,
  ChevronRight,
} from "lucide-react";

import DashboardHeader from "./components/DashboardHeader";
import LiveSensorsPanel from "./components/LiveSensorsPanel";
import PhysicalLayout from "./components/PhysicalLayout";
import SystemLogs from "./components/SystemLogs";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [telemetry, setTelemetry] = useState(null);
  const [paths, setPaths] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sensorRes = await fetch("http://localhost:5000/data/nodes");
        const sensorData = await sensorRes.json();

        const pathRes = await fetch("http://localhost:7000/paths");
        const pathData = await pathRes.json();

        setTelemetry(sensorData);
        setPaths(pathData);
        setLastUpdateTime(new Date());

        // Calculate active alerts
        if (sensorData?.nodes) {
          const alerts = Object.values(sensorData.nodes).filter(
            (values) => values[0] > 0 || values[1] > 30 || values[2] > 45,
          ).length;
          setActiveAlerts(alerts);
        }
      } catch (err) {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Calculate summary statistics
  const totalPeople = Object.values(telemetry?.nodes || {}).reduce(
    (sum, v) => sum + (v[3] || 0),
    0,
  );

  const criticalNodes = Object.entries(telemetry?.nodes || {}).filter(
    ([_, values]) => values[0] > 0 || values[1] > 30 || values[2] > 45,
  ).length;

  const safeNodes = Object.keys(telemetry?.nodes || {}).length - criticalNodes;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center space-y-6">
          {/* Animated SAFE logo */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-4 rounded-full bg-blue-500/20 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              SAFE System
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Connecting to telemetry...
            </p>
          </div>

          {/* Loading progress bar */}
          <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-blue-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300"
    >
      {/* Main container with max width and padding */}
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <DashboardHeader
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          systemMode={telemetry?.systemMode}
          lastUpdate={telemetry?.timestamp}
        />

        {/* Real-time Status Bar */}
        <div
          className="flex items-center justify-between px-4 py-2 rounded-lg 
          bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                System Online
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              <span>
                Last update: {lastUpdateTime?.toLocaleTimeString() || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {Object.keys(telemetry?.nodes || {}).length} Sensors Active
            </span>
          </div>
        </div>

        {/* Summary Cards Grid - 4 cards in a row on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total People Card */}
          <div
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 
            border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 
              group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"
            />
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  +2.5%
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalPeople}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Total People</span>
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    in building
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Active Nodes Card */}
          <div
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 
            border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 
              group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"
            />
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Radio
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div className="flex gap-1">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-l-full">
                    {safeNodes} Safe
                  </span>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-r-full">
                    {criticalNodes} Alert
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Object.keys(telemetry?.nodes || {}).length}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Active Nodes</span>
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    monitoring
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Active Alerts Card */}
          <div
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 
            border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 
              group-hover:from-red-500/5 group-hover:to-orange-500/5 transition-all duration-500"
            />
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle
                    size={20}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <div className="flex gap-1">
                  <div className="flex items-center gap-1 text-xs">
                    <Flame size={10} className="text-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      {
                        Object.values(telemetry?.nodes || {}).filter(
                          (v) => v[0] > 0,
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Wind size={10} className="text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400">
                      {
                        Object.values(telemetry?.nodes || {}).filter(
                          (v) => v[1] > 30,
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Thermometer size={10} className="text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400">
                      {
                        Object.values(telemetry?.nodes || {}).filter(
                          (v) => v[2] > 45,
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-red-500">
                  {activeAlerts}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Active Alerts</span>
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    need attention
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Evacuation Paths Card */}
          <div
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 
            border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 
              group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-500"
            />
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Map
                    size={20}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                  A* Optimized
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Object.keys(paths || {}).length}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Evacuation Paths</span>
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    ready
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Live Sensors Panel (4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                Live Sensor Data
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500">Real-time</span>
              </div>
            </div>

            {/* Scrollable Sensors Panel */}
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
              <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <LiveSensorsPanel nodes={telemetry?.nodes} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column - Map and Logs (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Physical Layout/Map Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Map size={18} className="text-purple-500" />
                  Facility Map
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Source Nodes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Active Paths
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Critical Areas
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Container - Fixed height with no extra spacing */}
              <div
                className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-lg"
                style={{
                  height: "520px",
                  padding: 0,
                  margin: 0,
                }}
              >
                <PhysicalLayout paths={paths} nodes={telemetry} />

                {/* Map overlay indicators */}
                <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                  <div className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
                    Live View
                  </div>
                </div>
              </div>
            </div>

            {/* System Logs Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-amber-500" />
                  System Logs & Path Analysis
                </h2>
                <span className="text-xs text-slate-500">
                  Auto-refreshing every 2s
                </span>
              </div>

              <SystemLogs
                timestamp={telemetry?.timestamp}
                systemMode={telemetry?.systemMode}
                activeAlerts={activeAlerts}
                paths={paths}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>© 2024 SAFE Emergency Management System</span>
              <span>v2.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span>System ID: {telemetry?.systemId || "N/A"}</span>
              <span>Floor: {telemetry?.floorId || "floor-1"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
