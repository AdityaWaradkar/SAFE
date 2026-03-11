import { useState, useEffect } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";
import layout from "./assets/layout_v1.png";

const DEFAULT_VALUES = [10, 10, 30.0, 12];

const NODE_LOCATIONS = {
  Room: ["N_1", "N_14", "N_8", "N_13", "N_18"],
  Corridor: [
    "N_2",
    "N_6",
    "N_15",
    "N_16",
    "N_17",
    "N_12",
    "N_9",
    "N_10",
    "N_5",
  ],
  "Conference Room": ["N_4", "N_7"],
  "Safe Room": ["N_19"],
  Exits: ["N_20", "N_11", "N_3"],
};

const ALL_NODES = Object.values(NODE_LOCATIONS).flat();

const INITIAL_STATE = {
  nodes: Object.fromEntries(
    ALL_NODES.map((node) => [node, [...DEFAULT_VALUES]]),
  ),
};

export default function App() {
  const [activeLocation, setActiveLocation] = useState("Room");
  const [activeNode, setActiveNode] = useState(NODE_LOCATIONS["Room"][0]);
  const [state, setState] = useState(INITIAL_STATE);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const handleLocationChange = (location) => {
    setActiveLocation(location);
    setActiveNode(NODE_LOCATIONS[location][0]);
  };

  const handleSliderChange = (index, value) => {
    setState((prev) => {
      const next = structuredClone(prev);
      next.nodes[activeNode][index] = value;
      return next;
    });
  };

  const currentValues = state.nodes[activeNode];
  const locationNodes = NODE_LOCATIONS[activeLocation];

  useDataSender(state);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">SAFE Node Control Panel</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Real-time sensor simulation and system publishing.
            </p>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        <Button
          title="Select Location"
          items={Object.keys(NODE_LOCATIONS)}
          active={activeLocation}
          onSelect={handleLocationChange}
        />

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Select Node
          </h2>

          <select
            value={activeNode}
            onChange={(e) => setActiveNode(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {locationNodes.map((node) => (
              <option key={node} value={node}>
                {node}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Slider values={currentValues} onChange={handleSliderChange} />

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src={layout}
              alt="Building Layout"
              className="w-full h-[350px] object-contain"
            />
          </div>
        </div>

        <footer className="flex justify-between text-sm text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-700">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System Active
          </span>
          <span>Publishing every 5 seconds</span>
        </footer>
      </div>
    </div>
  );
}
