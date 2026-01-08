import { useState } from "react";
import Button from "./Components/Button";
import Slider from "./Components/Slider";
import useDataSender from "./Hooks/useDataSender";

const DEFAULT_VALUES = [50, 50, 70.0];

const ROOMS = ["room1", "room2", "room3", "room4", "room5", "safeRoom"];
const CORRIDORS = [
  "corridor1",
  "corridor2",
  "corridor3",
  "corridor4",
  "corridor5",
  "corridor6",
];

const INITIAL_STATE = {
  rooms: Object.fromEntries(ROOMS.map((r) => [r, [...DEFAULT_VALUES]])),
  corridors: Object.fromEntries(CORRIDORS.map((c) => [c, [...DEFAULT_VALUES]])),
  conferenceRoom: {
    A: [...DEFAULT_VALUES],
    B: [...DEFAULT_VALUES],
  },
};

export default function App() {
  const [section, setSection] = useState("rooms");
  const [activeEntity, setActiveEntity] = useState("room1");
  const [state, setState] = useState(INITIAL_STATE);

  const currentValues =
    section === "conferenceRoom"
      ? state.conferenceRoom[activeEntity]
      : state[section][activeEntity];

  const handleSliderChange = (index, value) => {
    setState((prev) => {
      const next = structuredClone(prev);

      if (section === "conferenceRoom") {
        next.conferenceRoom[activeEntity][index] = value;
      } else {
        next[section][activeEntity][index] = value;
      }

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
            System Control Interface
          </h1>
          <p className="text-slate-500">
            Real-time control and monitoring of system zones.
          </p>
        </header>

        {/* Section Selector */}
        <Button
          title="Sections"
          items={["rooms", "corridors", "conferenceRoom"]}
          active={section}
          onSelect={(value) => {
            setSection(value);
            if (value === "rooms") setActiveEntity("room1");
            if (value === "corridors") setActiveEntity("corridor1");
            if (value === "conferenceRoom") setActiveEntity("A");
          }}
        />

        {/* Entity Selector */}
        {section === "rooms" && (
          <Button
            title="Rooms"
            items={ROOMS}
            active={activeEntity}
            onSelect={setActiveEntity}
          />
        )}

        {section === "corridors" && (
          <Button
            title="Corridors"
            items={CORRIDORS}
            active={activeEntity}
            onSelect={setActiveEntity}
          />
        )}

        {section === "conferenceRoom" && (
          <Button
            title="Conference Room Channels"
            items={["A", "B"]}
            active={activeEntity}
            onSelect={setActiveEntity}
          />
        )}

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
