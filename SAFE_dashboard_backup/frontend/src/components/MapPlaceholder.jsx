import { useEffect, useRef } from "react";
import FloorMap from "../assets/floor_map_1.svg?react";

const GREEN_EDGES = ["R1_1", "R1_2", "C_1", "C_2", "C_3", "C_4"];

export default function MapPlaceholder() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const svg = wrapperRef.current?.querySelector("svg");
    if (!svg) return;

    const elements = svg.querySelectorAll("[id]");
    elements.forEach((el) => {
      if (GREEN_EDGES.includes(el.id)) {
        el.style.stroke = "#22c55e";
        el.style.strokeWidth = "4";
        el.style.fill = "none";
      }
    });
  }, []);

  return (
    <div className="flex justify-center items-start">
      <div
        ref={wrapperRef}
        className="bg-white rounded-md overflow-hidden
                   w-[80%]
                   max-w-[1100px]
                   aspect-[4/3]
                   flex items-center justify-center"
      >
        <FloorMap className="w-full h-full object-contain scale-[1.85]" />
      </div>
    </div>
  );
}
