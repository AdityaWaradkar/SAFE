import { ReactSVG } from "react-svg";
import { useEffect, useRef, useState, useCallback } from "react";

import layout from "../assets/layout_v1.svg";
import { CORRIDOR_MAPPING } from "../constants/corridorMapping";
import NodeTooltip from "./NodeTooltip";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

export default function PhysicalLayout({ paths, nodes }) {
  const svgLoaded = useRef(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Manual scale control
  const [scale, setScale] = useState(1.6); // Default scale
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // normalized corridor → actual SVG id
  const corridorLookup = useRef({});
  // node id → actual SVG element
  const nodeLookup = useRef({});

  /**
   * Return real SVG element using normalized corridor id
   */
  const getCorridorElement = (normalizedId) => {
    if (!svgRef.current) return null;
    const realId = corridorLookup.current[normalizedId];
    if (!realId) return null;
    return svgRef.current.querySelector(`#${realId}`);
  };

  /**
   * Return real SVG element for a node
   */
  const getNodeElement = (nodeId) => {
    if (!svgRef.current) return null;
    return svgRef.current.querySelector(`#${nodeId}`);
  };

  /**
   * Highlight helper for both <path> and <g> elements
   */
  const highlightElement = (el, color, width) => {
    if (!el) return;

    if (el.tagName === "path") {
      el.style.stroke = color;
      el.style.strokeWidth = width;
      return;
    }

    if (el.tagName === "g") {
      const paths = el.querySelectorAll("path");
      paths.forEach((p) => {
        p.style.stroke = color;
        p.style.strokeWidth = width;
      });
    }
  };

  /**
   * Reset all corridors to default red
   */
  const resetCorridors = useCallback(() => {
    Object.values(CORRIDOR_MAPPING).forEach((corridorId) => {
      const el = getCorridorElement(corridorId);
      if (el) highlightElement(el, "red", "2");
    });
  }, []);

  /**
   * Reset all nodes to default black
   */
  const resetNodes = useCallback(() => {
    Object.keys(nodeLookup.current).forEach((nodeId) => {
      const el = getNodeElement(nodeId);
      if (el && el.tagName === "path") {
        el.style.stroke = "black";
        el.style.strokeWidth = "0.5";
      }
    });
  }, []);

  /**
   * Highlight source nodes (keys from paths object) in blue
   */
  const highlightSourceNodes = useCallback(() => {
    if (!paths || typeof paths !== "object") return;

    Object.keys(paths).forEach((sourceNode) => {
      const el = getNodeElement(sourceNode);
      if (el && el.tagName === "path") {
        el.style.stroke = "#3b82f6"; // Blue color
        el.style.strokeWidth = "3";
      }
    });
  }, [paths]);

  /**
   * Highlight evacuation corridors in green
   */
  const highlightEvacuationPaths = useCallback(() => {
    if (!paths || typeof paths !== "object") return;

    Object.values(paths).forEach((path) => {
      if (!Array.isArray(path) || path.length < 2) return;

      for (let i = 0; i < path.length - 1; i++) {
        const nodeA = path[i];
        const nodeB = path[i + 1];

        if (!nodeA || !nodeB) continue;

        const key = `${nodeA}-${nodeB}`;
        const reverseKey = `${nodeB}-${nodeA}`;

        const corridorId =
          CORRIDOR_MAPPING[key] || CORRIDOR_MAPPING[reverseKey];
        if (!corridorId) continue;

        const el = getCorridorElement(corridorId);
        if (!el) continue;

        highlightElement(el, "#22c55e", "4");
      }
    });
  }, [paths]);

  /**
   * Apply all highlights
   */
  const applyHighlights = useCallback(() => {
    if (!svgLoaded.current) return;

    resetCorridors();
    resetNodes();
    highlightSourceNodes();
    highlightEvacuationPaths();
  }, [
    resetCorridors,
    resetNodes,
    highlightSourceNodes,
    highlightEvacuationPaths,
  ]);

  /**
   * Handle node hover for tooltip
   */
  const handleNodeMouseEnter = (nodeId, event) => {
    const rect = event.target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setTooltipPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 10,
      });
    }

    setHoveredNode(nodeId);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  /**
   * Add hover event listeners to all nodes
   */
  const addNodeHoverListeners = useCallback(() => {
    Object.keys(nodeLookup.current).forEach((nodeId) => {
      const el = getNodeElement(nodeId);
      if (el) {
        el.addEventListener("mouseenter", (e) =>
          handleNodeMouseEnter(nodeId, e),
        );
        el.addEventListener("mouseleave", handleNodeMouseLeave);
        el.style.cursor = "pointer";
      }
    });
  }, []);

  /**
   * Apply manual scale and translation to SVG
   */
  const applyManualTransform = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
    svg.style.transformOrigin = "0 0";
  }, [scale, translate]);

  /**
   * Handle zoom in
   */
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  /**
   * Handle zoom out
   */
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  /**
   * Handle reset view
   */
  const handleResetView = () => {
    setScale(1.6);
    setTranslate({ x: 0, y: 0 });
  };

  /**
   * Handle mouse down for panning
   */
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    });
  };

  /**
   * Handle mouse move for panning
   */
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  /**
   * Handle mouse up to stop panning
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Apply transform when scale or translate changes
   */
  useEffect(() => {
    if (svgLoaded.current) {
      applyManualTransform();
    }
  }, [scale, translate, applyManualTransform]);

  /**
   * Re-run highlighting whenever paths change
   */
  useEffect(() => {
    applyHighlights();
  }, [paths, applyHighlights]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white overflow-hidden"
      style={{
        minHeight: "100%",
        position: "relative",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ReactSVG
        src={layout}
        beforeInjection={(svg) => {
          svgRef.current = svg;

          // Remove any default styling that might cause padding
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.removeAttribute("viewBox");

          // Set to fill container
          svg.style.position = "absolute";
          svg.style.top = "0";
          svg.style.left = "0";
          svg.style.width = "100%";
          svg.style.height = "100%";
          svg.style.backgroundColor = "white";
          svg.style.userSelect = "none"; // Prevent text selection while dragging
          svg.style.pointerEvents = "all";

          // Remove any transforms that might have been set
          svg.style.transform = "none";
        }}
        afterInjection={(svg) => {
          svgLoaded.current = true;

          // Force white background and remove any margins/padding
          svg.style.backgroundColor = "white";
          svg.style.margin = "0";
          svg.style.padding = "0";

          // Ensure all paths are visible
          const allPaths = svg.querySelectorAll("path");
          allPaths.forEach((path) => {
            if (!path.getAttribute("stroke")) {
              path.setAttribute("stroke", "black");
            }
          });

          const elements = svg.querySelectorAll("[id]");
          const corridorLookupTemp = {};
          const nodeLookupTemp = {};

          elements.forEach((el) => {
            const id = el.id;

            // Build corridor lookup
            if (id.startsWith("C")) {
              const match = id.match(/^C_?(\d+)/);
              if (match) {
                const normalized = `C${match[1]}`;
                corridorLookupTemp[normalized] = id;
              }
            }

            // Build node lookup
            if (id.startsWith("N_")) {
              nodeLookupTemp[id] = id;
            }
          });

          corridorLookup.current = corridorLookupTemp;
          nodeLookup.current = nodeLookupTemp;

          // Apply initial transform
          applyManualTransform();

          applyHighlights();
          addNodeHoverListeners();
        }}
        fallback={() => (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <p className="text-slate-400">Loading SVG...</p>
          </div>
        )}
        wrapperClassName="w-full h-full block"
      />

      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-30">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={18} className="text-slate-700 dark:text-slate-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={18} className="text-slate-700 dark:text-slate-300" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Reset View"
        >
          <Move size={18} className="text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs z-30">
        Scale: {scale.toFixed(1)}x
      </div>

      {/* Drag Instruction */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs z-30">
        Drag to pan • Scroll to zoom
      </div>

      {/* Node Tooltip */}
      {hoveredNode && nodes?.nodes?.[hoveredNode] && (
        <NodeTooltip
          nodeId={hoveredNode}
          data={nodes.nodes[hoveredNode]}
          position={tooltipPosition}
        />
      )}
    </div>
  );
}
