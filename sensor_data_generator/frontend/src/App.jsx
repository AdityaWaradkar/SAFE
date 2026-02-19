import { useState } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";

const DEFAULT_VALUES = [10, 10, 30.0, 12];

// Create node1 to node20
const NODES = Array.from({ length: 20 }, (_, i) => `node${i + 1}`);

const INITIAL_STATE = {
  nodes: Object.fromEntries(NODES.map((node) => [node, [...DEFAULT_VALUES]])),
};

export default function App() {
  const [activeNode, setActiveNode] = useState("node1");
  const [state, setState] = useState(INITIAL_STATE);

  const currentValues = state.nodes[activeNode];

  const handleSliderChange = (index, value) => {
    setState((prev) => {
      const next = structuredClone(prev);
      next.nodes[activeNode][index] = value;
      return next;
    });
  };

  useDataSender(state);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold mb-1">
            Node Control Interface
          </h1>
          <p className="text-slate-500">
            Real-time control and monitoring of sensor nodes.
          </p>
        </header>

        {/* Node Selector */}
        <Button
          title="Nodes"
          items={NODES}
          active={activeNode}
          onSelect={setActiveNode}
        />

        {/* Sliders */}
        <Slider values={currentValues} onChange={handleSliderChange} />

        {/* Status */}
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
