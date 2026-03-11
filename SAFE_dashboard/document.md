# SAFE Dashboard Module

SAFE System - Emergency Evacuation Management

***


# 1. Overview

The **SAFE Dashboard** is the primary visualization interface for the SAFE emergency evacuation system. It displays real-time sensor telemetry, evacuation paths computed by the A\* algorithm, and provides an interactive facility map for monitoring building safety during emergencies.

The dashboard serves as the central monitoring station for safety personnel, displaying:

- Live sensor data from all nodes (flame, smoke, temperature, people count)

- Real-time evacuation paths from the A\* algorithm

- Interactive facility map with node highlighting

- System status and alert monitoring

- Room-based sensor grouping for intuitive monitoring

The interface automatically refreshes every 2 seconds, ensuring safety personnel always have access to the most current building status.

***


# 2. System Architecture

    safe_dashboard
    │
    ├── src
    │   ├── components
    │   │   ├── DashboardHeader.jsx
    │   │   ├── LiveSensorsPanel.jsx
    │   │   ├── SensorCard.jsx
    │   │   ├── PhysicalLayout.jsx
    │   │   ├── NodeTooltip.jsx
    │   │   └── SystemLogs.jsx
    │   │
    │   ├── constants
    │   │   ├── corridorMapping.js
    │   │   └── roomMapping.js
    │   │
    │   ├── assets
    │   │   └── layout_v1.svg
    │   │
    │   └── App.jsx
    │
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js

The dashboard connects to two backend services:

- **Node Data API** (port 5000): Provides sensor telemetry

- **Paths API** (port 7000): Provides A\* algorithm evacuation paths

***


# 3. Data Sources

## Node Data API

**Endpoint:** `http://localhost:5000/data/nodes`

Provides real-time sensor data for all nodes in the system.

**Response Structure:**

```json
{
  "systemId": "SAFE-FLOOR-1",
  "floorId": "floor-1",
  "systemMode": "ACTIVE",
  "timestamp": "2026-03-11T15:50:45.907Z",
  "nodes": {
    "N_1": [0, 0, 20, 12],
    "N_2": [0, 0, 20, 12],
    ...
  }
}
```

Each node array contains four values:

| Index | Parameter    | Description                               |
| ----- | ------------ | ----------------------------------------- |
| 0     | Flame        | Flame detection (0 = none, >0 = detected) |
| 1     | Smoke        | Smoke level percentage                    |
| 2     | Temperature  | Temperature in Celsius                    |
| 3     | People Count | Number of people detected                 |


## Paths API

**Endpoint:** `http://localhost:7000/paths`

Provides evacuation paths computed by the A\* algorithm for each source node.

**Response Structure:**

```json
{
  "N_1": ["N_1", "N_2", "N_6", "N_15", "N_20"],
  "N_13": ["N_13", "N_12", "N_17", "N_19"],
  "N_14": ["N_14", "N_15", "N_20"],
  ...
}
```

Each key is a source node, and the value is an array representing the complete evacuation path from that node to an exit.

***


# 4. Core Components

## App.jsx

The root component that orchestrates the entire dashboard.

**Responsibilities:**

- Fetches data from both APIs every 2 seconds

- Manages dark/light mode state

- Calculates summary statistics (total people, active alerts, etc.)

- Renders the main layout grid

- Handles loading states

**Key Features:**

- 4-column summary cards with real-time statistics

- 12-column responsive grid layout

- Automatic data refresh interval

- Gradient backgrounds and smooth transitions

***


## DashboardHeader.jsx

The top navigation bar displaying system status and controls.

**Props:**

- `darkMode`: Current theme state

- `setDarkMode`: Theme toggle function

- `systemMode`: Current system mode (ACTIVE/IDLE)

- `lastUpdate`: Timestamp of last data update

**Features:**

- System mode indicator with animated pulse

- Connection status with time-ago display

- Animated dark mode toggle button

- Version information

**Status Indicators:**

- Green pulsing dot for active system

- Connection status (Connected/Delayed)

- Last update timestamp

- Active sensor count

***


## LiveSensorsPanel.jsx

Displays all sensor data grouped by room type.

**Props:**

- `nodes`: Sensor data object from telemetry

**Features:**

- Groups nodes by location (Room, Conference Room, Safe Room, Corridor, Exits)

- Sticky headers for each section

- Real-time update indicator

- Total people and active alert counters

- Custom scrollbar styling

- Gradient fade effects for scrollable content

**Location Configuration:**

```javascript
const locationConfig = {
  Room: { icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
  "Conference Room": { icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  "Safe Room": { icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
  Corridor: { icon: MapPin, color: "text-amber-500", bg: "bg-amber-50" },
  Exits: { icon: DoorOpen, color: "text-green-500", bg: "bg-green-50" }
};
```

***


## SensorCard.jsx

Individual card displaying all sensor values for a single node.

**Props:**

- `name`: Node ID (e.g., "N\_1")

- `flame`: Flame detection value

- `smoke`: Smoke level percentage

- `temperature`: Temperature in Celsius

- `people_count`: Number of people

**Features:**

- Color-coded risk levels (safe, caution, warning, critical)

- Status badges (Normal, FIRE DETECTED!, High Smoke, etc.)

- Progress bars for smoke and temperature

- Icon indicators for each sensor type

- Hover animations and shadows

**Risk Level Calculation:**

```javascript
const getRiskLevel = () => {
  if (flame > 0) return "critical";
  if (smoke > 30) return "warning";
  if (temperature > 45) return "warning";
  if (temperature > 35) return "caution";
  return "safe";
};
```

***


## PhysicalLayout.jsx

Interactive SVG map component with node highlighting and path visualization.

**Props:**

- `paths`: Evacuation path data from A\* algorithm

- `nodes`: Sensor data for tooltips

**Features:**


### Node Highlighting

- Source nodes (keys from paths object) highlighted in blue

- All nodes have hover tooltips showing sensor data

- Default node color is black


### Corridor Visualization

- Default corridors shown in red

- Active evacuation paths highlighted in green

- Corridor mapping connects node pairs to SVG elements


### Interactive Controls

- **Zoom In/Out**: Buttons to adjust scale (0.5x to 3.0x)

- **Pan/Drag**: Click and drag to move the view

- **Reset View**: Return to default scale and position

- **Tooltips**: Hover over nodes to see sensor data


### SVG Processing

- Automatic corridor ID mapping (C1, C2, etc.)

- Node ID mapping (N\_1, N\_2, etc.)

- White background in both light and dark modes

- Responsive scaling to fit container

**Highlight Functions:**

```javascript
const highlightElement = (el, color, width) => {
  if (el.tagName === "path") {
    el.style.stroke = color;
    el.style.strokeWidth = width;
  } else if (el.tagName === "g") {
    el.querySelectorAll("path").forEach(p => {
      p.style.stroke = color;
      p.style.strokeWidth = width;
    });
  }
};
```

***


## NodeTooltip.jsx

Floating tooltip that appears when hovering over nodes on the map.

**Props:**

- `nodeId`: The ID of the hovered node

- `data`: Array of sensor values \[flame, smoke, temperature, people]

- `position`: { x, y } coordinates for tooltip placement

**Features:**

- Color-coded status for each sensor type

- Arrow pointer pointing to the node

- Positioned above the hovered element

- Non-interactive (pointer-events: none) to prevent interference

**Sensor Display:**

- Flame: Shows "YES"/"NO" with red/green coloring

- Smoke: Shows percentage with progress bar

- Temperature: Shows value with color coding

- People: Shows count with blue icon

***


## SystemLogs.jsx

Displays system events and visualizes evacuation paths.

**Props:**

- `timestamp`: Last update timestamp

- `systemMode`: Current system mode

- `activeAlerts`: Number of active alerts

- `paths`: Evacuation path data

**Features:**


### Log Display

- Auto-scroll toggle for real-time monitoring

- Color-coded log types (info, success, warning, error)

- Timestamp for each log entry

- Log count and statistics


### Path Visualization

- Each evacuation path shown as a visual sequence

- Source nodes in green, exit nodes in red

- Arrow connections between nodes

- Expandable details showing path edges

- Path statistics (longest, shortest, total paths)


### Path Statistics

```javascript
const pathStats = {
  total: Object.keys(paths).length,
  longest: Math.max(...pathLengths),
  shortest: Math.min(...pathLengths)
};
```


### Log Types

| Type    | Icon          | Color   |
| ------- | ------------- | ------- |
| info    | Activity      | Blue    |
| success | CheckCircle   | Emerald |
| warning | AlertTriangle | Orange  |
| error   | AlertTriangle | Red     |

***


# 5. Constants and Configuration

## roomMapping.js

Defines the grouping of nodes by location type.

```javascript
export const NODE_LOCATIONS = {
  Room: ["N_1", "N_14", "N_8", "N_13", "N_18"],
  Corridor: ["N_2", "N_6", "N_15", "N_16", "N_17", "N_12", "N_9", "N_10", "N_5"],
  "Conference Room": ["N_4", "N_7"],
  "Safe Room": ["N_19"],
  Exits: ["N_20", "N_11", "N_3"]
};

export function getNodeLocation(nodeId) {
  for (const [location, nodes] of Object.entries(NODE_LOCATIONS)) {
    if (nodes.includes(nodeId)) return location;
  }
  return "Unknown";
}

export function getRoomNodes() {
  return [
    ...NODE_LOCATIONS.Room,
    ...NODE_LOCATIONS["Conference Room"],
    ...NODE_LOCATIONS["Safe Room"]
  ];
}
```


## corridorMapping.js

Maps node pairs to corridor IDs in the SVG.

```javascript
export const CORRIDOR_MAPPING = {
  "N_1-N_2": "C1",
  "N_2-N_6": "C3",
  "N_2-N_15": "C7",
  "N_14-N_15": "C13",
  "N_15-N_18": "C14",
  "N_15-N_20": "C18",
  "N_18-N_19": "C19",
  "N_5-N_9": "C2",
  "N_5-N_12": "C6",
  "N_12-N_13": "C11",
  "N_8-N_10": "C8",
  "N_8-N_13": "C9",
  "N_10-N_11": "C10",
  "N_4-N_7": "C17",
  "N_7-N_8": "C4",
  "N_16-N_17": "C15",
  "N_17-N_19": "C16"
};
```

***


# 6. Styling and Theme

## Dark/Light Mode

The dashboard supports seamless theme switching with CSS classes:

```javascript
useEffect(() => {
  const root = document.documentElement;
  if (darkMode) root.classList.add("dark");
  else root.classList.remove("dark");
}, [darkMode]);
```


## Color Scheme

| Element        | Light Mode       | Dark Mode             |
| -------------- | ---------------- | --------------------- |
| Background     | slate-50 → white | slate-950 → slate-900 |
| Cards          | white            | slate-900             |
| Borders        | slate-200        | slate-800             |
| Text Primary   | slate-900        | white                 |
| Text Secondary | slate-500        | slate-400             |


## Risk Level Colors

| Level    | Border      | Background | Text        |
| -------- | ----------- | ---------- | ----------- |
| Safe     | emerald-500 | emerald-50 | emerald-700 |
| Caution  | yellow-500  | yellow-50  | yellow-700  |
| Warning  | orange-500  | orange-50  | orange-700  |
| Critical | red-500     | red-50     | red-700     |


## Custom Scrollbar

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
}
```

***


# 7. Running the Dashboard

## Prerequisites

- Node.js (v16 or higher)

- npm or yarn

- Backend services running on ports 5000 and 7000


## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`


## Required Backend Services

1. **Node Data API** (port 5000) - Provides sensor telemetry

2. **Paths API** (port 7000) - Provides A\* evacuation paths

Both services must be running for the dashboard to function properly.


## Development Workflow

1. Start both backend services

2. Run `npm run dev` to start the dashboard

3. Open browser to `http://localhost:5173`

4. Dashboard auto-refreshes every 2 seconds

5. Monitor real-time sensor data and evacuation paths

***


# 8. Role in SAFE System

The SAFE Dashboard is the primary human-machine interface for the entire evacuation system. It serves as:

- **Command Center**: Provides safety personnel with real-time building status

- **Visualization Tool**: Displays A\* algorithm evacuation paths graphically

- **Monitoring Station**: Tracks all sensor nodes for anomalies

- **Alert System**: Highlights critical conditions requiring immediate attention

- **Validation Tool**: Verifies that evacuation algorithms are functioning correctly

The dashboard transforms raw sensor data and algorithmic path calculations into an intuitive, actionable interface that enables rapid decision-making during emergencies.

***
