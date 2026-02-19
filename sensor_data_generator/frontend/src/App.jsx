import { useState, useMemo } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";

const DEFAULT_VALUES = [10, 10, 30.0, 12];

/**
 * 🏢 Node Mapping by Location
 */
const NODE_LOCATIONS = {
  Room: ["node1", "node14", "node8", "node13", "node18"],
  Corridor: [
    "node2",
    "node6",
    "node15",
    "node16",
    "node17",
    "node12",
    "node9",
    "node10",
    "node5",
  ],
  "Conference Room": ["node4", "node7"],
  "Safe Room": ["node19"],
  Exits: ["node20", "node11", "node3"],
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

  /**
   * When location changes → auto select first node inside it
   */
  const handleLocationChange = (location) => {
    setActiveLocation(location);
    setActiveNode(NODE_LOCATIONS[location][0]);
  };

  const currentValues = state.nodes[activeNode];

  const handleSliderChange = (index, value) => {
    setState((prev) => {
      const next = structuredClone(prev);
      next.nodes[activeNode][index] = value;
      return next;
    });
  };

  useDataSender(state);

  const locationNodes = useMemo(
    () => NODE_LOCATIONS[activeLocation],
    [activeLocation],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold mb-1">SAFE Node Control Panel</h1>
          <p className="text-slate-500 text-sm">
            Real-time sensor simulation and system publishing.
          </p>
        </header>

        {/* Location Selector */}
        <Button
          title="Select Location"
          items={Object.keys(NODE_LOCATIONS)}
          active={activeLocation}
          onSelect={handleLocationChange}
        />

        {/* Node Dropdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Select Node
          </h2>

          <select
            value={activeNode}
            onChange={(e) => setActiveNode(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {locationNodes.map((node) => (
              <option key={node} value={node}>
                {node.replace("node", "N")}
              </option>
            ))}
          </select>
        </div>

        {/* Sliders */}
        <Slider values={currentValues} onChange={handleSliderChange} />

        {/* Footer Status */}
        <footer className="flex justify-between text-sm text-slate-400 pt-4 border-t">
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
