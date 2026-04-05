import { useState, useEffect } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";
import layout from "./assets/layout_v1.png";

// ============================================================
// HIGH RISK DEFAULT VALUES (Unsafe node preset)
// ============================================================
// Values that make a node HIGH RISK (not blocked, but very dangerous)
// Flame: 35% (High risk, near block threshold of 40%)
// Smoke: 55% (High risk, near block threshold of 60%)
// Temperature: 58°C (High risk, near block threshold of 60°C)
// People: 20 (Very crowded)

const HIGH_RISK_VALUES = [35, 55, 58, 20];

// ============================================================
// SAFE DEFAULT VALUES (Normal operating conditions)
// ============================================================
// Flame: 0% (Safe)
// Smoke: 5% (Safe)
// Temperature: 32°C (Normal Indian room temp)
// People: 2-8 (Varies by room type, set per node)

const SAFE_VALUES_BY_TYPE = {
  Room: [0, 5, 32, 4],
  Corridor: [0, 3, 31, 2],
  ConferenceRoom: [0, 4, 34, 6],
  SafeRoom: [0, 2, 30, 0],
  Exit: [0, 2, 30, 0],
};

// ============================================================
// SCENARIO DEFINITIONS
// ============================================================
// Scenario 1: Path through N1 → N2 → N6 → N15 → N20
const SCENARIO_1_SAFE_NODES = ["N_1", "N_2", "N_6", "N_15", "N_20"];

// Scenario 2: Path through N7 → N6 → N15 → N16 → N17 → N19
const SCENARIO_2_SAFE_NODES = ["N_7", "N_6", "N_15", "N_16", "N_17", "N_19"];

// Scenario 3: Path through N18 → N16 → N17 → N12 → N9 → N10 → N11
const SCENARIO_3_SAFE_NODES = [
  "N_18",
  "N_16",
  "N_17",
  "N_12",
  "N_9",
  "N_10",
  "N_11",
];

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

// Helper function to get safe values for a node based on its type
const getSafeValuesForNode = (nodeId) => {
  if (NODE_LOCATIONS["Room"].includes(nodeId))
    return [...SAFE_VALUES_BY_TYPE.Room];
  if (NODE_LOCATIONS["Corridor"].includes(nodeId))
    return [...SAFE_VALUES_BY_TYPE.Corridor];
  if (NODE_LOCATIONS["Conference Room"].includes(nodeId))
    return [...SAFE_VALUES_BY_TYPE.ConferenceRoom];
  if (NODE_LOCATIONS["Safe Room"].includes(nodeId))
    return [...SAFE_VALUES_BY_TYPE.SafeRoom];
  if (NODE_LOCATIONS["Exits"].includes(nodeId))
    return [...SAFE_VALUES_BY_TYPE.Exit];
  return [0, 5, 32, 2]; // Default fallback
};

// Initialize state with all nodes at safe values
const INITIAL_STATE = {
  nodes: Object.fromEntries(
    ALL_NODES.map((node) => [node, getSafeValuesForNode(node)]),
  ),
};

export default function App() {
  const [activeLocation, setActiveLocation] = useState("Room");
  const [activeNode, setActiveNode] = useState(NODE_LOCATIONS["Room"][0]);
  const [state, setState] = useState(INITIAL_STATE);
  const [darkMode, setDarkMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

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
    // Clear active scenario when user manually adjusts
    setActiveScenario(null);
  };

  // Apply a scenario: set safe nodes to safe values, all others to high risk
  const applyScenario = (safeNodes, scenarioName) => {
    setState((prev) => {
      const next = structuredClone(prev);

      ALL_NODES.forEach((node) => {
        if (safeNodes.includes(node)) {
          // This node is safe - set to normal values based on its type
          next.nodes[node] = getSafeValuesForNode(node);
        } else {
          // This node is unsafe - set to high risk values
          next.nodes[node] = [...HIGH_RISK_VALUES];
        }
      });

      return next;
    });

    setActiveScenario(scenarioName);

    // If current active node is now high risk, show feedback
    const currentValues = state.nodes[activeNode];
    if (currentValues && currentValues[0] > 20) {
      console.log(`Current node ${activeNode} is now in HIGH RISK state`);
    }
  };

  // Scenario 1: Path through N1 → N2 → N6 → N15 → N20
  const handleScenario1 = () => {
    applyScenario(SCENARIO_1_SAFE_NODES, "Scenario 1");
  };

  // Scenario 2: Path through N7 → N6 → N15 → N16 → N17 → N19
  const handleScenario2 = () => {
    applyScenario(SCENARIO_2_SAFE_NODES, "Scenario 2");
  };

  // Scenario 3: Path through N18 → N16 → N17 → N12 → N9 → N10 → N11
  const handleScenario3 = () => {
    applyScenario(SCENARIO_3_SAFE_NODES, "Scenario 3");
  };

  // Reset all nodes to safe values
  const handleReset = () => {
    setState((prev) => {
      const next = structuredClone(prev);
      ALL_NODES.forEach((node) => {
        next.nodes[node] = getSafeValuesForNode(node);
      });
      return next;
    });
    setActiveScenario(null);
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

        {/* Scenario Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={handleScenario1}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeScenario === "Scenario 1"
                ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Scenario 1
            <span className="block text-xs opacity-75 mt-0.5">
              N1 → N2 → N6 → N15 → N20
            </span>
          </button>

          <button
            onClick={handleScenario2}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeScenario === "Scenario 2"
                ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Scenario 2
            <span className="block text-xs opacity-75 mt-0.5">
              N7 → N6 → N15 → N16 → N17 → N19
            </span>
          </button>

          <button
            onClick={handleScenario3}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeScenario === "Scenario 3"
                ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Scenario 3
            <span className="block text-xs opacity-75 mt-0.5">
              N18 → N16 → N17 → N12 → N9 → N10 → N11
            </span>
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"
          >
            Reset All
            <span className="block text-xs opacity-75 mt-0.5">
              Safe values for all nodes
            </span>
          </button>
        </div>

        {/* Active Scenario Indicator */}
        {activeScenario && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <span className="font-medium">Active Scenario:</span>{" "}
              {activeScenario}
              <span className="text-xs opacity-75 ml-2">
                (Only specified safe nodes have normal values; all others are
                HIGH RISK)
              </span>
            </p>
          </div>
        )}

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
            {locationNodes.map((node) => {
              const nodeValues = state.nodes[node];
              const isHighRisk = nodeValues && nodeValues[0] > 20;
              return (
                <option key={node} value={node}>
                  {node} {isHighRisk ? "[HIGH RISK]" : "[Safe]"}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Slider
            values={currentValues}
            onChange={handleSliderChange}
            nodeId={activeNode}
          />

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
