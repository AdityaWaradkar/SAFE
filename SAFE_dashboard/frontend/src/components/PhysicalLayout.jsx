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
  // normalized corridor id → actual SVG element (e.g., "C1" → element with id "C1-213204")
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

  /**
   * Return real SVG element for a node
   */
  const getNodeElement = (nodeId) => {
    if (!svgRef.current) return null;
    return svgRef.current.querySelector(`#${nodeId}`);
  };

  /**
   * Return real SVG element for a corridor using normalized ID
   */
  const getCorridorElement = (normalizedId) => {
    if (!svgRef.current) return null;
    const element = corridorLookup.current[normalizedId];
    return element || null;
  };

  /**
   * Determine if a corridor should animate forward or reverse based on path direction
   * OPPOSITE DIRECTION: Animation flows from end to start (reverse of path order)
   */
  const getCorridorDirection = useCallback((nodeA, nodeB, path) => {
    const indexA = path.indexOf(nodeA);
    const indexB = path.indexOf(nodeB);

    if (indexA !== -1 && indexB !== -1) {
      // OPPOSITE: Return reverse direction so animation goes from end to start
      // If nodeA comes before nodeB in path (normal order), animate reverse (from nodeB to nodeA)
      // If nodeA comes after nodeB, animate forward
      return indexA < indexB ? -1 : 1;
    }

    return -1; // Default to reverse direction
  }, []);

  /**
   * Highlight helper for both <path> and <g> elements
   */
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

  /**
   * Add marching ants animation to a path with direction
   */
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

  /**
   * Remove marching ants animation
   */
  const removeMarchingAnts = useCallback((pathElement) => {
    if (!pathElement) return;

    pathElement.style.strokeDasharray = "";
    pathElement.style.strokeDashoffset = "";
    pathElement.style.transition = "";

    animatedElements.current.delete(pathElement);
  }, []);

  /**
   * Animation frame function
   */
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

  /**
   * Start animation
   */
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    offsetRef.current = 0;
    animate();
  }, [animate]);

  /**
   * Stop animation
   */
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

  /**
   * Reset all corridors to default red
   */
  const resetCorridors = useCallback(() => {
    console.log("\n========== RESETTING CORRIDORS ==========");
    stopAnimation();
    animatedElements.current.clear();

    Object.values(CORRIDOR_MAPPING).forEach((corridorId) => {
      const el = getCorridorElement(corridorId);
      if (el) {
        highlightElement(el, "red", "2");
        removeMarchingAnts(el);
      }
    });
    console.log("All corridors reset to default red color\n");
  }, [removeMarchingAnts, stopAnimation]);

  /**
   * Reset all nodes to default black
   */
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

  /**
   * Validate if a path is valid (starts in room/conference room AND ends in exit/safe room)
   */
  const isValidPath = useCallback(
    (sourceNode, path) => {
      if (!Array.isArray(path) || path.length < 2) return false;

      const startNode = sourceNode;
      const endNode = path[path.length - 1];

      const isValidStart = validStartNodes.has(startNode);
      const isValidEnd = validEndNodes.has(endNode);

      return isValidStart && isValidEnd;
    },
    [validStartNodes, validEndNodes],
  );

  /**
   * Highlight source nodes (keys from paths object) in blue
   * Only highlight if they are valid start nodes AND path ends in valid end node
   */
  const highlightSourceNodes = useCallback(() => {
    if (!paths || typeof paths !== "object") return;

    console.log("\n========== VALIDATING PATHS ==========");
    console.log(
      `Valid start nodes (Room + Conference Room): ${Array.from(validStartNodes).join(", ")}`,
    );
    console.log(
      `Valid end nodes (Exit + Safe Room): ${Array.from(validEndNodes).join(", ")}\n`,
    );

    let validPathsCount = 0;
    let invalidStartCount = 0;
    let invalidEndCount = 0;

    Object.entries(paths).forEach(([sourceNode, path]) => {
      const startLocation = getNodeLocation(sourceNode);
      const endNode =
        Array.isArray(path) && path.length > 0 ? path[path.length - 1] : null;
      const endLocation = endNode ? getNodeLocation(endNode) : "Unknown";

      const isValidStart = validStartNodes.has(sourceNode);
      const isValidEnd = endNode ? validEndNodes.has(endNode) : false;

      if (!isValidStart) {
        console.log(
          `✗ PATH REJECTED: ${sourceNode} (${startLocation}) → ${endNode} (${endLocation})`,
        );
        console.log(`  Reason: Start node is not a Room or Conference Room\n`);
        invalidStartCount++;
        return;
      }

      if (!isValidEnd) {
        console.log(
          `✗ PATH REJECTED: ${sourceNode} (${startLocation}) → ${endNode} (${endLocation})`,
        );
        console.log(`  Reason: End node is not an Exit or Safe Room\n`);
        invalidEndCount++;
        return;
      }

      console.log(
        `✓ PATH ACCEPTED: ${sourceNode} (${startLocation}) → ${endNode} (${endLocation})`,
      );
      validPathsCount++;

      const el = getNodeElement(sourceNode);
      if (el && el.tagName === "path") {
        el.style.stroke = "#3b82f6";
        el.style.strokeWidth = "3";
      }
    });

    console.log(`\n--- VALIDATION SUMMARY ---`);
    console.log(
      `Valid paths (start in room + end in exit/safe): ${validPathsCount}`,
    );
    console.log(`Invalid paths (wrong start node): ${invalidStartCount}`);
    console.log(`Invalid paths (wrong end node): ${invalidEndCount}`);
    console.log(`Total paths received: ${Object.keys(paths).length}\n`);
  }, [paths, validStartNodes, validEndNodes]);

  /**
   * Highlight evacuation corridors with risk-based opacity
   * Only process valid paths (start in room/conference room AND end in exit/safe room)
   */
  const highlightEvacuationPaths = useCallback(() => {
    if (!paths || typeof paths !== "object") {
      console.log("No paths data available for corridor highlighting");
      return;
    }

    console.log("\n========== HIGHLIGHTING EVACUATION PATHS ==========");
    console.log("Using single color: GREEN (#22c55e)");
    console.log(
      "Animation direction: FROM END TO START (reverse of path order)",
    );
    console.log("Only showing paths that:");
    console.log("  - Start in Room or Conference Room");
    console.log("  - End in Exit or Safe Room\n");

    let totalSegments = 0;
    let processedCorridors = new Set();
    let validPathsCount = 0;
    let invalidStartCount = 0;
    let invalidEndCount = 0;

    Object.entries(paths).forEach(([sourceNode, path]) => {
      // Validate start node
      if (!validStartNodes.has(sourceNode)) {
        console.log(
          `--- SKIPPED: ${sourceNode} (${getNodeLocation(sourceNode)}) - Start node invalid ---\n`,
        );
        invalidStartCount++;
        return;
      }

      // Validate end node
      const endNode =
        Array.isArray(path) && path.length > 0 ? path[path.length - 1] : null;
      if (!endNode || !validEndNodes.has(endNode)) {
        const endLocation = endNode ? getNodeLocation(endNode) : "Unknown";
        console.log(
          `--- SKIPPED: ${sourceNode} → ${endNode || "NO END"} (${endLocation}) - End node invalid ---\n`,
        );
        invalidEndCount++;
        return;
      }

      validPathsCount++;

      if (!Array.isArray(path) || path.length < 2) {
        console.warn(`Invalid path for source node ${sourceNode}:`, path);
        return;
      }

      console.log(
        `\n--- PATH: ${sourceNode} (${getNodeLocation(sourceNode)}) → ${endNode} (${getNodeLocation(endNode)}) | ${path.length} nodes ---`,
      );
      console.log(`Full path: ${path.join(" → ")}`);
      console.log(
        `Animation will flow from ${path[path.length - 1]} (end) to ${path[0]} (start)\n`,
      );

      const metrics = pathMetrics?.metrics?.[sourceNode];

      // Iterate through each segment in the path
      for (let i = 0; i < path.length - 1; i++) {
        const nodeA = path[i];
        const nodeB = path[i + 1];
        totalSegments++;

        const key = `${nodeA}-${nodeB}`;
        const reverseKey = `${nodeB}-${nodeA}`;
        const corridorId =
          CORRIDOR_MAPPING[key] || CORRIDOR_MAPPING[reverseKey];

        if (!corridorId) {
          console.log(
            `  ✗ Segment ${i + 1}: ${nodeA} → ${nodeB} - NO CORRIDOR MAPPING FOUND`,
          );
          continue;
        }

        const el = getCorridorElement(corridorId);
        if (!el) {
          console.log(
            `  ✗ Segment ${i + 1}: ${nodeA} → ${nodeB} - Corridor "${corridorId}" NOT FOUND IN SVG`,
          );
          continue;
        }

        // Adjust opacity based on risk if overlay is enabled
        let opacity = 1;
        let riskInfo = "";

        if (showRiskOverlay && metrics?.segments) {
          const segment = metrics.segments.find(
            (s) =>
              (s.from === nodeA && s.to === nodeB) ||
              (s.from === nodeB && s.to === nodeA),
          );
          if (segment) {
            if (segment.risk > 50) {
              opacity = Math.max(0.3, 1 - segment.risk / 200);
              riskInfo = ` [RISK: ${segment.risk}%, OPACITY: ${opacity.toFixed(2)}]`;
            } else {
              riskInfo = ` [RISK: ${segment.risk}%]`;
            }
          }
        }

        const direction = getCorridorDirection(nodeA, nodeB, path);
        const directionText = direction === 1 ? "→" : "←";
        const directionDesc =
          direction === 1 ? "FORWARD (end to start)" : "REVERSE (end to start)";

        // For console output, show animation direction relative to the segment
        const animationFrom = direction === 1 ? nodeB : nodeA;
        const animationTo = direction === 1 ? nodeA : nodeB;

        highlightElement(el, PATH_COLOR, "4", opacity);

        if (!processedCorridors.has(corridorId)) {
          processedCorridors.add(corridorId);
          console.log(
            `  ✓ Segment ${i + 1}: ${nodeA} ⇄ ${nodeB} → Corridor "${corridorId}"`,
          );
          console.log(
            `    Animation: ${animationFrom} ${directionText} ${animationTo} (${directionDesc})${riskInfo}`,
          );
        } else {
          console.log(
            `  ✓ Segment ${i + 1}: ${nodeA} ⇄ ${nodeB} → Corridor "${corridorId}" (already highlighted)`,
          );
          console.log(
            `    Animation: ${animationFrom} ${directionText} ${animationTo} (${directionDesc})${riskInfo}`,
          );
        }

        if (isAnimating) {
          addMarchingAnts(el, direction);
        }
      }
    });

    console.log(`\n--- SUMMARY ---`);
    console.log(
      `Valid paths (start in room + end in exit/safe): ${validPathsCount}`,
    );
    console.log(`Invalid paths (wrong start node): ${invalidStartCount}`);
    console.log(`Invalid paths (wrong end node): ${invalidEndCount}`);
    console.log(`Total segments processed: ${totalSegments}`);
    console.log(`Unique corridors highlighted: ${processedCorridors.size}`);
    console.log(
      `Corridors used: ${Array.from(processedCorridors).sort().join(", ")}`,
    );
    console.log(`Animation status: ${isAnimating ? "ACTIVE" : "PAUSED"}`);
    if (showRiskOverlay) {
      console.log(`Risk overlay: ENABLED (opacity reduced for risks > 50%)`);
    }
    console.log("\n");

    if (isAnimating && animatedElements.current.size > 0) {
      startAnimation();
    } else if (isAnimating && animatedElements.current.size === 0) {
      console.log("No corridors to animate");
    } else {
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
    validEndNodes,
  ]);

  /**
   * Apply all highlights
   */
  const applyHighlights = useCallback(() => {
    if (!svgLoaded.current) {
      console.log("SVG not loaded yet, skipping highlights");
      return;
    }

    console.log("\n========== APPLYING HIGHLIGHTS ==========");
    console.log(
      `Total paths received: ${paths ? Object.keys(paths).length : 0}`,
    );
    console.log(`Risk overlay: ${showRiskOverlay ? "ENABLED" : "DISABLED"}`);
    console.log(`Animation: ${isAnimating ? "ACTIVE" : "PAUSED"}\n`);

    resetCorridors();
    resetNodes();
    highlightSourceNodes();
    highlightEvacuationPaths();
  }, [
    resetCorridors,
    resetNodes,
    highlightSourceNodes,
    highlightEvacuationPaths,
    paths,
    pathMetrics,
    showRiskOverlay,
    isAnimating,
  ]);

  /**
   * Toggle animation
   */
  const toggleAnimation = useCallback(() => {
    setIsAnimating((prev) => {
      const newState = !prev;
      console.log(
        `\n[Animation] ${newState ? "Starting" : "Stopping"} animations`,
      );

      if (newState) {
        Object.entries(paths || {}).forEach(([sourceNode, path]) => {
          // Only animate valid paths (start in room, end in exit/safe)
          if (!validStartNodes.has(sourceNode)) return;
          const endNode =
            Array.isArray(path) && path.length > 0
              ? path[path.length - 1]
              : null;
          if (!endNode || !validEndNodes.has(endNode)) return;
          if (!Array.isArray(path) || path.length < 2) return;

          for (let i = 0; i < path.length - 1; i++) {
            const nodeA = path[i];
            const nodeB = path[i + 1];

            const key = `${nodeA}-${nodeB}`;
            const reverseKey = `${nodeB}-${nodeA}`;
            const corridorId =
              CORRIDOR_MAPPING[key] || CORRIDOR_MAPPING[reverseKey];
            if (!corridorId) continue;

            const el = getCorridorElement(corridorId);
            if (el) {
              const direction = getCorridorDirection(nodeA, nodeB, path);
              addMarchingAnts(el, direction);
            }
          }
        });

        if (animatedElements.current.size > 0) {
          startAnimation();
        }
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
  }, [
    paths,
    addMarchingAnts,
    startAnimation,
    stopAnimation,
    getCorridorDirection,
    validStartNodes,
    validEndNodes,
  ]);

  /**
   * Toggle risk overlay
   */
  const toggleRiskOverlay = useCallback(() => {
    setShowRiskOverlay((prev) => {
      const newState = !prev;
      console.log(`\n[Risk Overlay] ${newState ? "Enabled" : "Disabled"}`);
      return newState;
    });
  }, []);

  /**
   * Handle path hover for showing metrics
   */
  const handlePathMouseEnter = (sourceNode, event) => {
    // Only show metrics for valid paths
    if (validStartNodes.has(sourceNode)) {
      const path = paths?.[sourceNode];
      const endNode =
        Array.isArray(path) && path.length > 0 ? path[path.length - 1] : null;
      if (endNode && validEndNodes.has(endNode)) {
        setHoveredPath(sourceNode);
      }
    }
  };

  const handlePathMouseLeave = () => {
    setHoveredPath(null);
  };

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
    if (e.button !== 0) return;
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
    if (isDragging) {
      setIsDragging(false);
    }
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
   * Re-run highlighting whenever paths or metrics change
   */
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
          console.log("\n========== SVG LOADED ==========");
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

          console.log(
            `Corridors found in SVG: ${Object.keys(corridorLookupTemp).sort().join(", ")}`,
          );
          console.log(
            `Total corridors: ${Object.keys(corridorLookupTemp).length}`,
          );
          console.log(`Total nodes: ${Object.keys(nodeLookupTemp).length}\n`);

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
            <span>Evacuation Path (end → start)</span>
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

      {/* Path Metrics Panel - Only show for valid paths */}
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
                <span>Segments:</span>
                <span>{pathMetrics.metrics[hoveredPath].segment_count}</span>
              </div>
              {pathMetrics.metrics[hoveredPath].most_dangerous && (
                <div className="mt-1 pt-1 border-t border-white/20">
                  <div className="text-orange-300">Most Dangerous:</div>
                  <div>
                    {pathMetrics.metrics[hoveredPath].most_dangerous.from} →{" "}
                    {pathMetrics.metrics[hoveredPath].most_dangerous.to}
                  </div>
                  <div>
                    Risk: {pathMetrics.metrics[hoveredPath].most_dangerous.risk}
                  </div>
                </div>
              )}
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
