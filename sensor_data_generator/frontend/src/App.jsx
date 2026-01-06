import React, { useState, useCallback } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";

// Supported system regions
const REGIONS = ["r1", "r2", "r3", "r4", "c1", "c2"];

// Default sensor values per region
const DEFAULT_VALUES = [50, 50, 70];

export default function App() {
  // Track currently selected region for UI interaction
  const [activeRegion, setActiveRegion] = useState("r1");

  // Maintain independent values for each region
  const [regionValues, setRegionValues] = useState(() =>
    Object.fromEntries(REGIONS.map((r) => [r, [...DEFAULT_VALUES]]))
  );

  // Update slider values for the active region
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

  // Send all region data periodically
  useDataSender(regionValues);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {/* Application header */}
        <header>
          <h1 className="text-3xl font-extrabold mb-2">
            System Control Interface
          </h1>
          <p className="text-slate-500">
            Configure regional sensor parameters.
          </p>
        </header>

        {/* Region selector */}
        <Button
          regions={REGIONS}
          activeRegion={activeRegion}
          onSelect={setActiveRegion}
        />

        {/* Parameter sliders */}
        <Slider
          values={regionValues[activeRegion]}
          onChange={handleSliderChange}
          scopeId={activeRegion}
        />

        {/* System status */}
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
