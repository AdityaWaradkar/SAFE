import { ReactSVG } from "react-svg";
import { useEffect, useRef, useState, useCallback } from "react";

import layout from "../assets/layout_v2.svg";
import { CORRIDOR_MAPPING } from "../constants/corridorMapping";
import { NODE_LOCATIONS, getNodeLocation } from "../constants/roomMapping";
import NodeTooltip from "./NodeTooltip";
import {
  ZoomIn,
  ZoomOut,
  Move,
  Play,
  Pause,
  AlertTriangle,
  Activity,
} from "lucide-react";

export default function PhysicalLayout({ paths, nodes, pathMetrics }) {
  const svgLoaded = useRef(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [showRiskOverlay, setShowRiskOverlay] = useState(false);
  const animationRef = useRef(null);
  const offsetRef = useRef(0);

  // Manual scale control
  const [scale, setScale] = useState(1.6);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // node id → actual SVG element
  const nodeLookup = useRef({});
  // normalized corridor id → actual SVG element
  const corridorLookup = useRef({});
  // Store animated elements with their direction
  const animatedElements = useRef(new Map());

  // Set of valid start nodes (Room and Conference Room)
  const validStartNodes = new Set([
    ...NODE_LOCATIONS.Room,
    ...NODE_LOCATIONS["Conference Room"],
  ]);

  // Set of valid end nodes (Exit and Safe Room)
  const validEndNodes = new Set([
    ...NODE_LOCATIONS.Exits,
    ...NODE_LOCATIONS["Safe Room"],
  ]);

  // Single green color for all paths
  const PATH_COLOR = "#22c55e";

  const getNodeElement = (nodeId) => {
    if (!svgRef.current) return null;
    return svgRef.current.querySelector(`#${nodeId}`);
  };

  const getCorridorElement = (normalizedId) => {
    if (!svgRef.current) return null;
    const element = corridorLookup.current[normalizedId];
    return element || null;
  };

  const getCorridorDirection = useCallback((nodeA, nodeB, path) => {
    const indexA = path.indexOf(nodeA);
    const indexB = path.indexOf(nodeB);

    if (indexA !== -1 && indexB !== -1) {
      return indexA < indexB ? -1 : 1;
    }
    return -1;
  }, []);

  const highlightElement = (el, color, width, opacity = 1) => {
    if (!el) return;

    if (el.tagName === "path") {
      el.style.stroke = color;
      el.style.strokeWidth = width;
      el.style.strokeOpacity = opacity;
      return;
    }

    if (el.tagName === "g") {
      const paths = el.querySelectorAll("path");
      paths.forEach((p) => {
        p.style.stroke = color;
        p.style.strokeWidth = width;
        p.style.strokeOpacity = opacity;
      });
    }
  };

  const addMarchingAnts = useCallback((pathElement, direction = 1) => {
    if (!pathElement || pathElement.tagName !== "path") return;

    if (!pathElement.hasAttribute("data-original-stroke")) {
      pathElement.setAttribute(
        "data-original-stroke",
        pathElement.style.stroke || "#22c55e",
      );
    }

    pathElement.style.strokeDasharray = "8 4";
    pathElement.style.strokeDashoffset = "0";
    pathElement.style.transition = "none";

    animatedElements.current.set(pathElement, { direction });
  }, []);

  const removeMarchingAnts = useCallback((pathElement) => {
    if (!pathElement) return;

    pathElement.style.strokeDasharray = "";
    pathElement.style.strokeDashoffset = "";
    pathElement.style.transition = "";

    animatedElements.current.delete(pathElement);
  }, []);

  const animate = useCallback(() => {
    const step = 0.8;

    const animateFrame = () => {
      offsetRef.current = (offsetRef.current + step) % 16;

      animatedElements.current.forEach((data, el) => {
        if (el && el.style) {
          const offset =
            data.direction === 1 ? offsetRef.current : 16 - offsetRef.current;
          el.style.strokeDashoffset = offset.toString();
        }
      });

      animationRef.current = requestAnimationFrame(animateFrame);
    };

    animationRef.current = requestAnimationFrame(animateFrame);
  }, []);

  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    offsetRef.current = 0;
    animate();
  }, [animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    animatedElements.current.forEach((_, el) => {
      if (el && el.style) {
        el.style.strokeDashoffset = "0";
        el.style.strokeDasharray = "";
      }
    });
  }, []);

  const resetCorridors = useCallback(() => {
    stopAnimation();
    animatedElements.current.clear();

    Object.values(CORRIDOR_MAPPING).forEach((corridorId) => {
      const el = getCorridorElement(corridorId);
      if (el) {
        highlightElement(el, "red", "2");
        removeMarchingAnts(el);
      }
    });
  }, [removeMarchingAnts, stopAnimation]);

  const resetNodes = useCallback(() => {
    Object.keys(nodeLookup.current).forEach((nodeId) => {
      const el = getNodeElement(nodeId);
      if (el && el.tagName === "path") {
        el.style.stroke = "black";
        el.style.strokeWidth = "0.5";
        el.style.strokeOpacity = "1";
      }
    });
  }, []);

  // UPDATED: Handle new path data format (paths is an object with node_path, corridor_path, goal_type)
  const isValidPath = useCallback(
    (sourceNode, pathData) => {
      if (
        !pathData ||
        !Array.isArray(pathData.node_path) ||
        pathData.node_path.length < 2
      )
        return false;

      const isValidStart = validStartNodes.has(sourceNode);
      const isValidEnd = pathData.goal_type === "primary";

      return isValidStart && isValidEnd;
    },
    [validStartNodes],
  );

  // UPDATED: Highlight source nodes using new format
  const highlightSourceNodes = useCallback(() => {
    if (!paths || typeof paths !== "object") return;

    Object.entries(paths).forEach(([sourceNode, pathData]) => {
      if (!pathData) return;

      const isValidStart = validStartNodes.has(sourceNode);
      const isValidEnd = pathData.goal_type === "primary";

      if (isValidStart && isValidEnd) {
        const el = getNodeElement(sourceNode);
        if (el && el.tagName === "path") {
          el.style.stroke = "#3b82f6";
          el.style.strokeWidth = "3";
        }
      }
    });
  }, [paths, validStartNodes]);

  // UPDATED: Highlight evacuation paths using new format
  const highlightEvacuationPaths = useCallback(() => {
    if (!paths || typeof paths !== "object") return;

    let totalSegments = 0;
    let processedCorridors = new Set();

    Object.entries(paths).forEach(([sourceNode, pathData]) => {
      if (!pathData) return;

      if (!validStartNodes.has(sourceNode)) return;
      if (pathData.goal_type !== "primary") return;

      const nodePath = pathData.node_path;
      if (!Array.isArray(nodePath) || nodePath.length < 2) return;

      for (let i = 0; i < nodePath.length - 1; i++) {
        const nodeA = nodePath[i];
        const nodeB = nodePath[i + 1];
        totalSegments++;

        const key = `${nodeA}-${nodeB}`;
        const reverseKey = `${nodeB}-${nodeA}`;
        const corridorId =
          CORRIDOR_MAPPING[key] || CORRIDOR_MAPPING[reverseKey];

        if (!corridorId) continue;

        const el = getCorridorElement(corridorId);
        if (!el) continue;

        let opacity = 1;
        if (showRiskOverlay && pathMetrics?.metrics?.[sourceNode]?.segments) {
          const segment = pathMetrics.metrics[sourceNode].segments.find(
            (s) =>
              (s.from === nodeA && s.to === nodeB) ||
              (s.from === nodeB && s.to === nodeA),
          );
          if (segment && segment.risk > 50) {
            opacity = Math.max(0.3, 1 - segment.risk / 200);
          }
        }

        const direction = getCorridorDirection(nodeA, nodeB, nodePath);
        highlightElement(el, PATH_COLOR, "4", opacity);

        if (!processedCorridors.has(corridorId)) {
          processedCorridors.add(corridorId);
        }

        if (isAnimating) {
          addMarchingAnts(el, direction);
        }
      }
    });

    if (isAnimating && animatedElements.current.size > 0) {
      startAnimation();
    } else if (!isAnimating) {
      stopAnimation();
    }
  }, [
    paths,
    pathMetrics,
    isAnimating,
    showRiskOverlay,
    addMarchingAnts,
    startAnimation,
    stopAnimation,
    getCorridorDirection,
    validStartNodes,
  ]);

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

  const toggleAnimation = useCallback(() => {
    setIsAnimating((prev) => {
      const newState = !prev;
      if (newState) {
        highlightEvacuationPaths();
      } else {
        stopAnimation();
        animatedElements.current.forEach((_, el) => {
          if (el && el.style) {
            el.style.strokeDasharray = "";
            el.style.strokeDashoffset = "";
          }
        });
        animatedElements.current.clear();
      }
      return newState;
    });
  }, [highlightEvacuationPaths, stopAnimation]);

  const toggleRiskOverlay = useCallback(() => {
    setShowRiskOverlay((prev) => {
      const newState = !prev;
      setTimeout(() => highlightEvacuationPaths(), 50);
      return newState;
    });
  }, [highlightEvacuationPaths]);

  const handlePathMouseEnter = (sourceNode) => {
    const pathData = paths?.[sourceNode];
    if (
      pathData &&
      validStartNodes.has(sourceNode) &&
      pathData.goal_type === "primary"
    ) {
      setHoveredPath(sourceNode);
    }
  };

  const handlePathMouseLeave = () => {
    setHoveredPath(null);
  };

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

  const addNodeHoverListeners = useCallback(() => {
    Object.keys(nodeLookup.current).forEach((nodeId) => {
      const el = getNodeElement(nodeId);
      if (el) {
        el.removeEventListener("mouseenter", handleNodeMouseEnter);
        el.removeEventListener("mouseleave", handleNodeMouseLeave);
        el.addEventListener("mouseenter", (e) =>
          handleNodeMouseEnter(nodeId, e),
        );
        el.addEventListener("mouseleave", handleNodeMouseLeave);
        el.style.cursor = "pointer";
      }
    });
  }, []);

  const applyManualTransform = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
    svg.style.transformOrigin = "0 0";
  }, [scale, translate]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setScale(1.6);
    setTranslate({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (svgLoaded.current) {
      applyManualTransform();
    }
  }, [scale, translate, applyManualTransform]);

  useEffect(() => {
    applyHighlights();

    return () => {
      stopAnimation();
    };
  }, [paths, pathMetrics, showRiskOverlay, applyHighlights, stopAnimation]);

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

          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.removeAttribute("viewBox");

          svg.style.position = "absolute";
          svg.style.top = "0";
          svg.style.left = "0";
          svg.style.width = "100%";
          svg.style.height = "100%";
          svg.style.backgroundColor = "white";
          svg.style.userSelect = "none";
          svg.style.pointerEvents = "all";
          svg.style.transform = "none";
        }}
        afterInjection={(svg) => {
          svgLoaded.current = true;

          svg.style.backgroundColor = "white";
          svg.style.margin = "0";
          svg.style.padding = "0";

          const elements = svg.querySelectorAll("[id]");
          const corridorLookupTemp = {};
          const nodeLookupTemp = {};

          elements.forEach((el) => {
            const id = el.id;

            if (id.startsWith("N_")) {
              nodeLookupTemp[id] = el;
            }

            if (id.match(/^C\d+-/)) {
              const normalizedId = id.split("-")[0];
              corridorLookupTemp[normalizedId] = el;
            }
          });

          nodeLookup.current = nodeLookupTemp;
          corridorLookup.current = corridorLookupTemp;

          const allPaths = svg.querySelectorAll("path");
          allPaths.forEach((path) => {
            if (!path.getAttribute("stroke")) {
              path.setAttribute("stroke", "black");
            }
          });

          applyManualTransform();
          applyHighlights();
          addNodeHoverListeners();
        }}
        fallback={() => (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <p className="text-slate-400">Loading SVG...</p>
          </div>
        )}
        wrapperClassname="w-full h-full block"
      />

      {/* Control Panel */}
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
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
        <button
          onClick={toggleAnimation}
          className={`p-2 rounded-lg border shadow-lg transition-colors ${
            isAnimating
              ? "bg-green-500 hover:bg-green-600 border-green-600"
              : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
          }`}
          title={isAnimating ? "Stop Animation" : "Start Animation"}
        >
          {isAnimating ? (
            <Pause size={18} className="text-white" />
          ) : (
            <Play size={18} className="text-slate-700 dark:text-slate-300" />
          )}
        </button>
        <button
          onClick={toggleRiskOverlay}
          className={`p-2 rounded-lg border shadow-lg transition-colors ${
            showRiskOverlay
              ? "bg-orange-500 hover:bg-orange-600 border-orange-600"
              : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
          }`}
          title={showRiskOverlay ? "Hide Risk Overlay" : "Show Risk Overlay"}
        >
          <AlertTriangle
            size={18}
            className={
              showRiskOverlay
                ? "text-white"
                : "text-slate-700 dark:text-slate-300"
            }
          />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs z-30 space-y-2">
        <div className="font-semibold">Path Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>Source Nodes (Rooms only)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-0.5 bg-green-500"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #22c55e 0px, #22c55e 4px, transparent 4px, transparent 8px)",
              }}
            />
            <span>Evacuation Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500" />
            <span>Default Corridor</span>
          </div>
          {showRiskOverlay && (
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/20">
              <Activity size={12} className="text-orange-300" />
              <span>Risk-based opacity</span>
            </div>
          )}
        </div>
      </div>

      {/* Path Metrics Panel */}
      {hoveredPath &&
        validStartNodes.has(hoveredPath) &&
        pathMetrics?.metrics?.[hoveredPath] && (
          <div className="absolute bottom-20 left-3 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs z-40 max-w-[200px]">
            <div className="font-semibold mb-1">Path: {hoveredPath}</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total Risk:</span>
                <span className="font-mono">
                  {pathMetrics.metrics[hoveredPath].total_risk}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Path Length:</span>
                <span>
                  {pathMetrics.metrics[hoveredPath].path_length} nodes
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Occupancy:</span>
                <span>{pathMetrics.metrics[hoveredPath].max_occupancy}</span>
              </div>
            </div>
          </div>
        )}

      {/* Scale Indicator */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs z-30">
        Scale: {scale.toFixed(1)}x
      </div>

      {/* Update Time Indicator */}
      {pathMetrics?.timestamp && (
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs z-30">
          Updated: {new Date(pathMetrics.timestamp * 1000).toLocaleTimeString()}
        </div>
      )}

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
