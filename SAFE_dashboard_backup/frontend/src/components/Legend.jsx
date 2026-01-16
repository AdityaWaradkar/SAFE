export default function Legend() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-lg font-semibold mb-6">Legend</h3>

      <div className="space-y-4 text-lg">
        <div className="flex items-center gap-4">🔥 Fire</div>

        <div className="flex items-center gap-4">☁️ Smoke</div>

        <div className="flex items-center gap-4">🌡️ High Temperature</div>

        <div className="flex items-center gap-4">🟩 Safe Exit</div>
      </div>
    </div>
  );
}
