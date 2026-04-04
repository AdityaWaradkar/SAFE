import { downloadPDF } from "../services/api";

export default function Controls({ reload }) {
  return (
    <div className="flex gap-4">
      <button
        onClick={reload}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
      >
        Refresh Logs
      </button>

      <button
        onClick={downloadPDF}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
      >
        Download PDF
      </button>
    </div>
  );
}
