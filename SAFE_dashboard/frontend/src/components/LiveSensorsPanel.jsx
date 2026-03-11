import SensorCard from "./SensorCard";
import { NODE_LOCATIONS } from "../constants/roomMapping";
import { Building2, MapPin, Shield, DoorOpen, Users } from "lucide-react";

export default function LiveSensorsPanel({ nodes }) {
  if (!nodes || typeof nodes !== "object") {
    return (
      <section className="space-y-4">
        <div className="text-xs uppercase text-slate-500 flex items-center gap-2">
          <Building2 size={14} />
          Live Room Sensors
        </div>
        <p className="text-sm text-slate-400">No telemetry data available</p>
      </section>
    );
  }

  // Group nodes by location type
  const groupedRooms = {
    Room: [],
    "Conference Room": [],
    "Safe Room": [],
    Corridor: [],
    Exits: [],
  };

  // Populate groups with sensor data
  Object.entries(NODE_LOCATIONS).forEach(([location, nodeIds]) => {
    nodeIds.forEach((nodeId) => {
      if (nodes[nodeId]) {
        groupedRooms[location].push({
          name: nodeId,
          flame: nodes[nodeId]?.[0] ?? 0,
          smoke: nodes[nodeId]?.[1] ?? 0,
          temperature: nodes[nodeId]?.[2] ?? 0,
          people_count: nodes[nodeId]?.[3] ?? 0,
        });
      }
    });
  });

  // Location icons and colors
  const locationConfig = {
    Room: {
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
    },
    "Conference Room": {
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      border: "border-purple-200 dark:border-purple-800",
    },
    "Safe Room": {
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    Corridor: {
      icon: MapPin,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-800",
    },
    Exits: {
      icon: DoorOpen,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-800",
    },
  };

  // Calculate summary statistics
  const totalPeople = Object.values(nodes).reduce(
    (sum, values) => sum + (values[3] || 0),
    0,
  );
  const activeAlerts = Object.values(nodes).filter(
    (values) => values[0] > 0 || values[1] > 30 || values[2] > 45,
  ).length;

  return (
    <section className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-slate-500 flex items-center gap-2">
          <Building2 size={14} />
          Live Room Sensors
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {totalPeople} People
          </div>
          {activeAlerts > 0 && (
            <div className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              {activeAlerts} Alert{activeAlerts > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Grouped sections */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(groupedRooms).map(([location, rooms]) => {
          if (rooms.length === 0) return null;

          const config = locationConfig[location];
          const Icon = config.icon;

          return (
            <div key={location} className="space-y-3">
              {/* Location header */}
              <div
                className={`sticky top-0 z-10 py-2 px-3 rounded-lg ${config.bg} ${config.border} border backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={config.color} />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {location}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {rooms.length} {rooms.length === 1 ? "space" : "spaces"}
                  </span>
                </div>
              </div>

              {/* Sensor cards for this location */}
              <div className="space-y-3">
                {rooms.map((room) => (
                  <SensorCard key={room.name} {...room} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add custom scrollbar styles */}
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
      `}</style>
    </section>
  );
}
