import React, { useState, useCallback } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";

const REGIONS = ["r1", "r2", "r3", "r4", "c1", "c2"];
const DEFAULT_VALUES = [50, 50, 70]; // Flame, Smoke, Temperature

export default function App() {
  const [activeRegion, setActiveRegion] = useState("r1");

  const [regionValues, setRegionValues] = useState(() => {
    return Object.fromEntries(
      REGIONS.map((region) => [region, [...DEFAULT_VALUES]])
    );
  });

  const handleSliderChange = useCallback(
    (index, value) => {
      setRegionValues((prev) => ({
        ...prev,
        [activeRegion]: prev[activeRegion].map((v, i) =>
          i === index ? value : v
        ),
      }));
    },
    [activeRegion]
  );

  useDataSender(activeRegion, regionValues);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold mb-2">
            System Control Interface
          </h1>
          <p className="text-slate-500">
            Configure active nodes and signal strength.
          </p>
        </header>

        {/* Controls */}
        <Button
          regions={REGIONS}
          activeRegion={activeRegion}
          onSelect={setActiveRegion}
        />

        <Slider
          values={regionValues[activeRegion]}
          onChange={handleSliderChange}
          scopeId={activeRegion}
        />

        {/* Status */}
        <footer className="flex justify-between text-sm text-slate-400 pt-4 border-t">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System Active
          </span>
          <span>Syncing every 5s</span>
        </footer>
      </div>
    </div>
  );
}
