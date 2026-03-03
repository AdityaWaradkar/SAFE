import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* =====================================================
   LOAD GRAPH
===================================================== */

const graphData = JSON.parse(
  fs.readFileSync(new URL("./graph.json", import.meta.url), "utf-8"),
);

const MATRIX = graphData.matrix;
const SIZE = graphData.size;

/* =====================================================
   GLOBAL STATE
===================================================== */

let latestNodeSnapshot = null;
let latestAStarResult = null;

/* =====================================================
   RECEIVE NODE DATA
===================================================== */

app.post("/data/nodes", (req, res) => {
  latestNodeSnapshot = req.body;
  console.log("📥 Nodes received");
  res.json({ status: "ok" });
});

/* =====================================================
   EXPOSE A* OUTPUT (GET + POST)
===================================================== */

function sendPath(res) {
  if (!latestAStarResult) {
    return res.status(204).json({ message: "No path available yet" });
  }
  res.json(latestAStarResult);
}

app.get("/data/path", (req, res) => {
  sendPath(res);
});

app.post("/data/path", (req, res) => {
  sendPath(res);
});

/* =====================================================
   BACKGROUND A* LOOP (Every 5 sec)
===================================================== */

setInterval(() => {
  if (!latestNodeSnapshot) return;

  if (latestNodeSnapshot.systemMode !== "ACTIVE") {
    latestAStarResult = null;
    return;
  }

  if (!latestNodeSnapshot.nodes) return;

  console.log("🔥 Running A*...");

  const blockedNodes = getBlockedNodes(latestNodeSnapshot.nodes);

  const startIndex = 0;
  const goalIndex = SIZE - 1;

  const pathIndices = runAStar(startIndex, goalIndex, blockedNodes);

  latestAStarResult = {
    timestamp: new Date().toISOString(),
    systemMode: "ACTIVE",
    blockedNodes: blockedNodes.map((i) => `node${i + 1}`),
    path: pathIndices.map((i) => `node${i + 1}`),
  };

  console.log("✅ Path Updated:", latestAStarResult.path);
}, 5000);

/* =====================================================
   BLOCKED NODE DETECTION
===================================================== */

function getBlockedNodes(nodesObject) {
  const blocked = [];

  for (const [key, value] of Object.entries(nodesObject)) {
    const index = parseInt(key.replace("node", "")) - 1;

    if (value.flame > 20 || value.smoke > 70 || value.temperature > 60) {
      blocked.push(index);
    }
  }

  return blocked;
}

/* =====================================================
   A* ALGORITHM
===================================================== */

function runAStar(start, goal, blockedNodes) {
  const openSet = new Set([start]);
  const cameFrom = {};

  const gScore = Array(SIZE).fill(Infinity);
  const fScore = Array(SIZE).fill(Infinity);

  gScore[start] = 0;
  fScore[start] = heuristic(start, goal);

  while (openSet.size > 0) {
    const current = getLowestFScore(openSet, fScore);

    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(current);

    for (let neighbor = 0; neighbor < SIZE; neighbor++) {
      const weight = MATRIX[current][neighbor];

      if (weight === 0 || weight === "*") continue;
      if (blockedNodes.includes(neighbor)) continue;

      const tentativeG = gScore[current] + weight;

      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristic(neighbor, goal);
        openSet.add(neighbor);
      }
    }
  }

  return [];
}

/* =====================================================
   HEURISTIC
===================================================== */

function heuristic(a, b) {
  return Math.abs(a - b);
}

/* =====================================================
   UTILITIES
===================================================== */

function getLowestFScore(openSet, fScore) {
  let lowestNode = null;
  let lowestValue = Infinity;

  for (let node of openSet) {
    if (fScore[node] < lowestValue) {
      lowestValue = fScore[node];
      lowestNode = node;
    }
  }

  return lowestNode;
}

function reconstructPath(cameFrom, current) {
  const path = [current];

  while (cameFrom[current] !== undefined) {
    current = cameFrom[current];
    path.unshift(current);
  }

  return path;
}

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {
  console.log(`🚀 SAFE backend running at http://localhost:${PORT}`);
});
