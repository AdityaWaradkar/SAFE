import SensorCard from "./SensorCard";

export default function LiveSensorsPanel({ emergency }) {
  const rooms = emergency
    ? [
        { id: 1, name: "Room 1", status: "Dense Smoke", temp: 48, smoke: 65 },
        { id: 2, name: "Room 2", status: "Fire Detected", temp: 92, smoke: 90 },
        {
          id: 3,
          name: "Room 3",
          status: "High Temperature",
          temp: 55,
          smoke: 20,
        },
        { id: 4, name: "Room 4", status: "Safe for Now", temp: 26, smoke: 5 },
      ]
    : [
        { id: 1, name: "Room 1", status: "Safe for Now", temp: 22, smoke: 0 },
        { id: 2, name: "Room 2", status: "Safe for Now", temp: 23, smoke: 0 },
        { id: 3, name: "Room 3", status: "Safe for Now", temp: 21, smoke: 0 },
        { id: 4, name: "Room 4", status: "Safe for Now", temp: 24, smoke: 0 },
      ];

  return (
    <section className="space-y-4">
      <div className="flex justify-between text-xs uppercase text-slate-500 dark:text-slate-400">
        <span>Live Sensors</span>
        <span
          className={`font-semibold ${
            emergency ? "text-red-500" : "text-emerald-500"
          }`}
        >
          ● {emergency ? "EMERGENCY" : "RECEIVING DATA"}
        </span>
      </div>

      {rooms.map((room) => (
        <SensorCard key={room.id} {...room} />
      ))}
    </section>
  );
}
