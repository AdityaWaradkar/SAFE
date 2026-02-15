import SensorCard from "./SensorCard";

/**
 * MOCK payload shaped exactly like backend JSON
 */
const sensorPayload = {
  rooms: {
    room1: { flame: 50, smoke: 44, temperature: 70, people_count: 6 },
    room2: { flame: 80, smoke: 70, temperature: 92, people_count: 12 },
    room3: { flame: 0, smoke: 30, temperature: 45, people_count: 4 },
    room4: { flame: 0, smoke: 10, temperature: 26, people_count: 0 },
  },
};

export default function LiveSensorsPanel({ emergency }) {
  const rooms = Object.entries(sensorPayload.rooms).map(
    ([key, data], index) => ({
      id: index,
      name: key.toUpperCase(),
      ...data,
    })
  );

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
