export default function StatusPanel() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-lg font-semibold mb-6">Current Status</h3>

      <div className="text-lg py-3">Room 1: Dense Smoke</div>

      <div className="text-lg py-3 text-red-600 font-semibold">
        Room 2: Fire Detected
      </div>

      <div className="text-lg py-3 text-orange-600">
        Room 3: High Temperature
      </div>

      <div className="text-lg py-3 text-green-600">Room 4: Safe for Now</div>
    </div>
  );
}
