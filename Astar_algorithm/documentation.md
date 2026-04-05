# Dynamic Risk-Aware Path Routing Algorithm for Human Evacuation

## Complete Algorithm Documentation

---

# Document Overview

This document provides the complete specification of the Dynamic Risk-Aware Path Routing Algorithm. The algorithm computes real-time, adaptive evacuation routes for building occupants during emergency situations by continuously monitoring environmental hazards and occupancy levels. No implementation code is included; only algorithmic definitions, decision rules, formulas, and architectural descriptions are presented.

---

# Part 1: Algorithm Overview

## 1.1 Purpose

The algorithm dynamically computes safe evacuation paths from any occupied room to safe destinations (exits or shelter areas) by integrating real-time sensor data including flame detection, smoke density, ambient temperature, and occupancy levels. Paths are continuously updated as environmental conditions change.

## 1.2 Key Capabilities

| Capability | Description |
|------------|-------------|
| Event-Driven Operation | Path recomputation occurs only when hazard levels change, not on a fixed schedule |
| Adaptive Goal Selection | Primary destinations (exits, safe rooms) are used when safe; algorithm falls back to secondary destinations (interior rooms) when primary goals become hazardous |
| Risk-Weighted Routing | Path costs incorporate environmental hazards, discouraging routes through dangerous areas |
| Congestion Avoidance | Occupancy penalties prevent routing through overcrowded spaces |
| Prioritized Evacuation | Rooms with higher occupancy or higher risk are processed first |
| Dual Output Format | Paths are provided as both node sequences (for backend processing) and corridor sequences (for navigation systems) |

## 1.3 System Architecture Layers

**Sensor Layer**
- Flame sensors (0-100% intensity mapping)
- Smoke detectors - MQ2 (0-100% density mapping)
- Temperature sensors (degrees Celsius)
- Occupancy sensors (people count per space)

**Processing Layer**
- Data fusion and change detection
- Risk value computation per node
- Occupancy factor calculation

**Decision Layer**
- Dynamic goal selection with primary/secondary fallback
- Source node prioritization
- Risk-aware path routing

**Output Layer**
- Node-based path sequences
- Corridor-based path sequences
- Path metrics (total risk, congestion levels, length)
- API endpoints for dashboard integration

---

# Part 2: Input Specifications

## 2.1 Building Graph

The building is modeled as an undirected weighted graph.

| Component | Description |
|-----------|-------------|
| Nodes | Represent physical spaces: rooms, corridors, exits, safe rooms, conference rooms |
| Edges | Represent physical connections between nodes |
| Edge Weight | Physical distance between connected nodes (measured in meters) |
| Node Types | Source nodes (occupied rooms requiring evacuation), Primary goals (exits and safe rooms), Secondary goals (conference rooms and interior rooms) |

## 2.2 Sensor Inputs

**Flame Sensor**
- Type: UV/IR analog sensor
- Raw Input: 0-5 volts
- Mapped Output: 0-100 percent
- Meaning: Percentage indicates flame intensity and proximity to the sensor

**Smoke Sensor (MQ2)**
- Type: Gas/smoke detector
- Raw Input: 0-1023 ADC value
- Mapped Output: 0-100 percent
- Meaning: Percentage indicates smoke density and visibility reduction

**Temperature Sensor**
- Type: Thermistor or thermocouple
- Output: Degrees Celsius
- Range: -40°C to 125°C
- Meaning: Ambient air temperature at the node location

**Occupancy Sensor**
- Type: PIR sensor, camera-based counting, or people counting system
- Output: Integer count of people present
- Additional Input: Room capacity (maximum safe occupancy)

## 2.3 Corridor Mapping

Each edge in the building graph maps to a unique corridor identifier for navigation purposes.

| Property | Description |
|----------|-------------|
| Mapping Format | Undirected pair (Node_A, Node_B) maps to Corridor_ID |
| Uniqueness | Each edge maps to exactly one corridor identifier |
| Bidirectional | Same corridor identifier used for travel in either direction |
| Lookup Method | Order-independent lookup (N_A-N_B same as N_B-N_A) |

## 2.4 Configuration Parameters

| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| Sampling Interval | 5 seconds | Time between sensor data collection cycles |
| Flame Block Threshold | 40 percent | Above this value, node is considered impassable |
| Smoke Block Threshold | 60 percent | Above this value, node is considered impassable |
| Temperature Block Threshold | 60 degrees Celsius | Above this value, node is considered impassable |
| Occupancy Penalty Weight | 0.5 | Contribution of congestion to edge cost |
| Priority Occupancy Weight | 0.7 | Importance of occupancy in source prioritization |
| Priority Risk Weight | 0.3 | Importance of risk in source prioritization |
| Heuristic Weight | 1.0 | Importance of estimated distance in path selection |

---

# Part 3: Sensor Thresholds

## 3.1 Temperature Thresholds (Indian Context)

These thresholds are calibrated for Indian climatic conditions where ambient temperatures routinely reach 40-45 degrees Celsius during summer months.

| Zone | Temperature Range | Human Impact | Algorithm Action | Penalty |
|------|-------------------|--------------|------------------|---------|
| Normal | Below 45°C | Routine summer temperature, normal human function | No penalty | 0 |
| Elevated | 45°C to 50°C | Heat wave conditions, discomfort, increased heart rate | Low penalty | 0.5 per degree above 45 |
| Hot | 50°C to 55°C | Severe heat stress, limited exposure under 30 minutes | Medium penalty | 2.0 per degree above 50 |
| Critical | 55°C to 60°C | Dangerous conditions, survival limited to under 10 minutes | High penalty | 5.0 per degree above 55 |
| Blocked | Above 60°C | Impassable, immediate health risk | Node blocked | Infinite |

**Justification:** A building in Rajasthan at 42 degrees Celsius should not have all nodes marked as hazardous. Blocking at lower thresholds would make the algorithm unusable in Indian conditions. Only truly dangerous heat above 55 degrees Celsius triggers high penalties, and blocking occurs only above 60 degrees Celsius.

## 3.2 Flame Thresholds

| Zone | Flame Percentage | Human Impact | Algorithm Action | Penalty |
|------|-----------------|--------------|------------------|---------|
| Safe | 0 percent | No fire detected | No penalty | 0 |
| Low Risk | 1 to 10 percent | Small flame at distance, minimal threat | Low penalty | 1.0 times percentage |
| Medium Risk | 10 to 20 percent | Visible fire nearby, increasing danger | Medium penalty | 4.0 times percentage above 10 |
| High Risk | 20 to 40 percent | Active fire within the node | High penalty | 8.0 times percentage above 20 |
| Blocked | Above 40 percent | Direct fire exposure, immediate danger | Node blocked | Infinite |

## 3.3 Smoke Thresholds

| Zone | Smoke Percentage | Human Impact | Algorithm Action | Penalty |
|------|-----------------|--------------|------------------|---------|
| Safe | Below 10 percent | Clean air or very light smoke | No penalty | 0 |
| Low Risk | 10 to 20 percent | Visible smoke, tolerable for short periods | Low penalty | 0.5 times percentage above 10 |
| Medium Risk | 20 to 40 percent | Reduced visibility, coughing, eye irritation | Medium penalty | 2.0 times percentage above 20 |
| High Risk | 40 to 60 percent | Dense smoke, breathing difficulty, disorientation | High penalty | 4.0 times percentage above 40 |
| Blocked | Above 60 percent | Zero visibility, cannot breathe, navigation impossible | Node blocked | Infinite |

## 3.4 Occupancy Thresholds

These thresholds are adjusted for Indian conditions where public spaces routinely experience higher densities than Western standards.

| Density (people per square meter) | Description | Penalty | Real-World Context |
|-----------------------------------|-------------|---------|---------------------|
| Below 1.0 | Light occupancy | 0.0 | Normal office or shop |
| 1.0 to 2.0 | Moderate occupancy | 0.2 | Typical market, busy corridor |
| 2.0 to 4.0 | Crowded | 0.5 | Rush hour metro, busy temple |
| 4.0 to 6.0 | Very crowded | 0.8 | Festival crowd, packed train |
| Above 6.0 | Critical | 1.0 | Stampede risk, physically impassable |

---

# Part 4: Core Functions

## 4.1 Node Risk Function

**Purpose:** Compute a continuous risk value for each node based on current sensor readings.

**Input:** Flame percentage (0 to 100), Smoke percentage (0 to 100), Temperature in degrees Celsius

**Output:** Risk value (zero to infinity)

**Decision Rules:**

| Condition | Result |
|-----------|--------|
| Flame exceeds 40 percent | Risk equals infinity (node impassable) |
| Smoke exceeds 60 percent | Risk equals infinity (node impassable) |
| Temperature exceeds 60 degrees Celsius | Risk equals infinity (node impassable) |
| None of the above | Risk equals sum of Flame Risk plus Smoke Risk plus Temperature Risk |

### Flame Risk Calculation

| Flame Range | Formula |
|-------------|---------|
| 0 percent | Risk contribution equals 0 |
| 1 to 10 percent | Risk contribution equals Flame percentage times 1.0 |
| 10 to 20 percent | Risk contribution equals 10 plus (Flame percentage minus 10) times 4.0 |
| 20 to 40 percent | Risk contribution equals 50 plus (Flame percentage minus 20) times 8.0 |

### Smoke Risk Calculation

| Smoke Range | Formula |
|-------------|---------|
| Below 10 percent | Risk contribution equals 0 |
| 10 to 20 percent | Risk contribution equals (Smoke percentage minus 10) times 0.5 |
| 20 to 40 percent | Risk contribution equals 5 plus (Smoke percentage minus 20) times 2.0 |
| 40 to 60 percent | Risk contribution equals 45 plus (Smoke percentage minus 40) times 4.0 |

### Temperature Risk Calculation

| Temperature Range | Formula |
|------------------|---------|
| Below 45 degrees Celsius | Risk contribution equals 0 |
| 45 to 50 degrees Celsius | Risk contribution equals (Temperature minus 45) times 0.5 |
| 50 to 55 degrees Celsius | Risk contribution equals 2.5 plus (Temperature minus 50) times 2.0 |
| 55 to 60 degrees Celsius | Risk contribution equals 12.5 plus (Temperature minus 55) times 5.0 |

### Example Risk Calculations

**Scenario 1: Normal Indian Summer Day**
- Temperature: 42 degrees Celsius
- Flame: 0 percent
- Smoke: 5 percent
- Total Risk: 0 (safe, no penalty)

**Scenario 2: Heat Wave Conditions**
- Temperature: 48 degrees Celsius
- Flame: 0 percent
- Smoke: 10 percent
- Total Risk: (48 minus 45) times 0.5 equals 1.5 (low risk)

**Scenario 3: Fire with Heat**
- Temperature: 52 degrees Celsius
- Flame: 15 percent
- Smoke: 30 percent
- Flame Risk: 10 plus (15 minus 10) times 4.0 equals 30
- Smoke Risk: 5 plus (30 minus 20) times 2.0 equals 25
- Temperature Risk: 2.5 plus (52 minus 50) times 2.0 equals 6.5
- Total Risk: 30 plus 25 plus 6.5 equals 61.5 (high risk, avoid)

**Scenario 4: Extreme Hazard**
- Temperature: 58 degrees Celsius
- Flame: 25 percent
- Smoke: 50 percent
- Flame Risk: 50 plus (25 minus 20) times 8.0 equals 90
- Smoke Risk: 45 plus (50 minus 40) times 4.0 equals 85
- Temperature Risk: 12.5 plus (58 minus 55) times 5.0 equals 27.5
- Total Risk: 90 plus 85 plus 27.5 equals 202.5 (very high risk)

## 4.2 Occupancy Penalty Function

**Purpose:** Calculate a penalty value for routing through congested areas to prevent bottleneck formation.

**Input:** People count in node, Room capacity, Floor area in square meters

**Output:** Penalty value from 0 to 1.0

**Calculation Method:**

First, compute density as people count divided by floor area.

Then apply the following decision rules:

| Density Range | Penalty | Traffic Condition |
|---------------|---------|-------------------|
| Below 1.0 person per square meter | 0.0 | Free flow, no congestion |
| 1.0 to 2.0 persons per square meter | 0.2 | Normal flow, slight congestion |
| 2.0 to 4.0 persons per square meter | 0.5 | Crowded, reduced walking speed |
| 4.0 to 6.0 persons per square meter | 0.8 | Very crowded, slow movement |
| Above 6.0 persons per square meter | 1.0 | Critical, stampede risk |

## 4.3 Edge Cost Function

**Purpose:** Determine the cost of traversing from one node to an adjacent node.

**Formula:**

Edge Cost from node U to node V equals Physical Distance between U and V plus Edge Risk plus Edge Occupancy

**Components:**

| Component | Formula | Description |
|-----------|---------|-------------|
| Physical Distance | Graph edge weight | Predefined distance between nodes in meters |
| Edge Risk | (Risk of node U plus Risk of node V) divided by 2 | Average environmental hazard of both nodes |
| Edge Occupancy | (Penalty of node U plus Penalty of node V) divided by 2 | Average congestion penalty of both nodes |

**Properties:**
- Edge Cost is always greater than or equal to Physical Distance
- Higher risk increases cost, discouraging dangerous routes
- Higher occupancy increases cost, discouraging crowded paths
- Edge Cost becomes infinite if either node has infinite risk

## 4.4 Heuristic Function

**Purpose:** Estimate the remaining cost from the current node to the nearest available goal. This estimate must be optimistic (never overestimating the true cost) to guarantee optimal path finding.

**Input:** Current node, Set of available goal nodes, Building graph structure

**Output:** Estimated distance to the nearest goal

**Calculation Method:**

For each goal in the available goals set:

| Condition | Estimated Distance |
|-----------|-------------------|
| Direct graph edge exists from current node to this goal | Use the actual graph distance |
| No direct connection exists | Add the minimum edge weight from current node to the minimum edge weight to the goal |
| No mathematical path possible | Use 0 as fallback |

Then take the minimum estimated distance across all goals.

**Property:** This heuristic is admissible, meaning it never overestimates the true remaining cost. This ensures the algorithm finds the optimal (minimum cost) path.

---

# Part 5: Algorithm Phases

## Phase 1: System Initialization

**Purpose:** Load all static configuration and prepare the system for operation.

**Steps:**

1. Load the building graph from configuration files, including all nodes, edges, and edge weights
2. Define node categories based on building layout:
   - Source nodes: all rooms that can be occupied and require evacuation paths
   - Primary goals: building exits and designated safe rooms
   - Secondary goals: conference rooms and interior rooms (fallback destinations)
3. Load corridor mapping that defines which corridor identifier corresponds to each edge
4. Initialize the API server for publishing results
5. Configure CORS settings for dashboard integration
6. Start the background thread for continuous monitoring
7. Check the system mode:
   - If Active Mode: proceed to Phase 2
   - If Passive Mode: remain idle, wait for activation signal

## Phase 2: Sensor Data Acquisition

**Purpose:** Collect current environmental and occupancy data from all sensors.

**Steps:**

1. Query all flame sensors and map readings to 0-100 percent scale
2. Query all smoke sensors (MQ2) and map readings to 0-100 percent scale
3. Query all temperature sensors and record values in degrees Celsius
4. Query all occupancy sensors to obtain people count per node
5. Retrieve room capacity data from configuration
6. Combine all data into a unified telemetry packet
7. Send the packet to the processing unit

**Sampling Frequency:** Data is collected every INTERVAL seconds (default: 5 seconds)

## Phase 3: Change Detection

**Purpose:** Determine whether path recomputation is necessary based on changes in environmental conditions.

**Input:** Current sensor data, Previously stored sensor data

**Output:** Boolean decision (recompute or skip)

**Detection Rules:**

| Sensor Type | Change Triggers Recompution | Threshold |
|-------------|------------------------------|-----------|
| Flame | Yes | Any change greater than 0 percent |
| Smoke | Yes | Any change greater than 1 percent |
| Temperature | Yes | Any change greater than 1 degree Celsius |
| Occupancy | No | Changes are ignored |

**Rationale:** Only hazard changes affect the safety of paths. Occupancy changes alone do not trigger recomputation to avoid excessive computational load. This event-driven approach ensures efficient use of processing resources.

## Phase 4: Dynamic Goal Selection

**Purpose:** Determine which destination nodes are currently safe and available for evacuation.

**Input:** Current sensor data for all nodes, Occupancy data, Primary goals list, Secondary goals list

**Output:** Set of available goal node identifiers

### Stage 1: Primary Goal Evaluation

For each primary goal (building exits and designated safe rooms), evaluate the following conditions:

| Check | Condition for Safety |
|-------|----------------------|
| Flame safety | Flame percentage is less than or equal to 40 percent |
| Smoke safety | Smoke percentage is less than or equal to 60 percent |
| Temperature safety | Temperature is less than or equal to 60 degrees Celsius |
| Occupancy availability | Current people count is less than room capacity |

If all conditions are satisfied, add the goal to the available set.

### Stage 2: Secondary Goal Fallback

**Trigger:** The available set remains empty after Stage 1 evaluation.

For each secondary goal (conference rooms and interior rooms), evaluate the same conditions:

| Check | Condition for Safety |
|-------|----------------------|
| Flame safety | Flame percentage is less than or equal to 40 percent |
| Smoke safety | Smoke percentage is less than or equal to 60 percent |
| Temperature safety | Temperature is less than or equal to 60 degrees Celsius |
| Occupancy availability | Current people count is less than room capacity |

If all conditions are satisfied, add the goal to the available set.

### Stage 3: No Goals Available

**Trigger:** The available set remains empty after Stage 2 evaluation.

**Actions Taken:**
- Log the event: "No safe destination available for evacuation"
- Trigger an emergency alert for human operators
- Mark all source nodes as having no available path
- Skip the pathfinding phase for this cycle

## Phase 5: Source Prioritization

**Purpose:** Order the source nodes so that rooms with higher risk or higher occupancy are processed first.

**Input:** List of all source nodes, Current risk map, Occupancy data for each node

**Output:** Priority queue sorted by descending priority score

### Priority Score Formula

Priority Score equals (Occupancy Ratio times 0.7) plus (Normalized Risk times 0.3)

**Component Calculations:**

| Component | Formula | Range | Description |
|-----------|---------|-------|-------------|
| Occupancy Ratio | People count divided by Room capacity | 0 to 1.0 (capped) | How full the room is |
| Normalized Risk | Node Risk divided by 200 | 0 to 1.0 (capped) | Normalized hazard level (200 is practical maximum risk) |

**Processing Order:** Nodes are processed in descending order of priority score (highest score first)

**Rationale:**
- Rooms with more people require immediate evacuation because more lives are at risk
- Rooms with higher hazard levels need faster evacuation due to deteriorating conditions
- The 0.7 weight on occupancy prioritizes saving more people over slightly higher risk

## Phase 6: Core Path Routing Algorithm

**Purpose:** Compute the optimal path from a single source node to any available goal node.

**Input:** Source node identifier, Set of available goal identifiers, Building graph structure, Current risk map, Current occupancy data

**Output:** Optimal path as an ordered list of nodes, or NULL if no path exists

### Step 1: Initialization

Initialize the following data structures:

| Data Structure | Initial State |
|----------------|---------------|
| Open Set | Contains a single entry: (heuristic value of source, source node) |
| Cost from Start | Source node cost equals 0; all other nodes cost equals infinity |
| Estimated Total Cost | Source node estimated cost equals heuristic of source; all others equal infinity |
| Parent Pointers | Empty dictionary (will map each node to its predecessor) |
| Explored Set | Empty set (nodes that have been processed) |

### Step 2: Main Loop

Execute the following steps while the Open Set is not empty.

#### Step 2.1: Node Selection
- Select the node from the Open Set that has the minimum Estimated Total Cost
- Remove this node from the Open Set

#### Step 2.2: Goal Check
- If the selected node is present in the Available Goals set:
  - Reconstruct the path by following Parent Pointers from the goal node back to the source node
  - Reverse the path to obtain source-to-goal order
  - Return the reconstructed path

#### Step 2.3: Exploration Check
- If the selected node is already in the Explored Set:
  - Skip this node and continue to the next iteration

#### Step 2.4: Mark as Explored
- Add the selected node to the Explored Set

#### Step 2.5: Neighbor Examination
For each neighbor node adjacent to the selected node in the building graph:

**Skip Conditions:**
- If the neighbor is already in the Explored Set, skip this neighbor
- If the neighbor has infinite risk (blocked node), skip this neighbor

**Cost Calculation:**
- Edge Risk equals (Risk of current node plus Risk of neighbor node) divided by 2
- Edge Occupancy equals (Penalty of current node plus Penalty of neighbor node) divided by 2
- Edge Cost equals Physical Distance plus Edge Risk plus Edge Occupancy
- Tentative Cost equals Cost from Start of current node plus Edge Cost

**Update Condition:**
- If Tentative Cost is less than the current Cost from Start of the neighbor:
  - Update Parent Pointer of neighbor to point to current node
  - Update Cost from Start of neighbor to equal Tentative Cost
  - Calculate Heuristic value for the neighbor (estimated distance to nearest goal)
  - Update Estimated Total Cost of neighbor to equal Tentative Cost plus Heuristic
  - Add the neighbor to the Open Set with its Estimated Total Cost as the key

### Step 3: No Path Found
- If the Open Set becomes empty without ever reaching a goal node:
  - Return NULL, indicating no safe path exists from this source

## Phase 7: Path Validation

**Purpose:** Filter paths based on destination quality. Only paths ending at primary goals are published as evacuation routes.

**Input:** Computed path (or NULL if no path found), Type of the goal node where the path ends

**Output:** Accepted path or rejection decision

**Decision Rules:**

| Path Endpoint Type | Action |
|--------------------|--------|
| Primary Goal (Exit or Safe Room) | Accept the path, store as evacuation route |
| Secondary Goal (Room or Conference Room) | Reject the path, mark as shelter-only (do not publish) |
| No path found | Reject, mark as no route available |

**Rationale:** Only paths that lead to true exits or designated safe rooms should be published as evacuation routes. Paths ending at interior rooms represent temporary shelter options and should not be presented to evacuees as final evacuation destinations.

## Phase 8: Path Metrics Calculation

**Purpose:** Compute performance metrics for each accepted path.

**Input:** Validated path (list of nodes), Current risk map, Current occupancy data, Building graph structure

**Output:** Metrics object containing various performance indicators

### Metrics Computed

| Metric | Calculation Method |
|--------|---------------------|
| Total Risk | Sum of edge risks for each consecutive pair in the path, where edge risk equals (Risk of node U plus Risk of node V) divided by 2 |
| Maximum Occupancy | Highest people count found along any node in the path |
| Path Length | Number of nodes in the path |
| Most Dangerous Segment | The edge (consecutive node pair) with the highest edge risk value |
| Segment Details | For each edge: starting node, ending node, physical distance, segment risk value |

## Phase 9: Corridor Path Generation

**Purpose:** Convert the node-based path into a corridor-based path for navigation systems.

**Input:** Node-based path (list of node identifiers), Corridor mapping configuration

**Output:** Corridor-based path (list of corridor identifiers)

### Conversion Process

For each consecutive pair of nodes in the node path (from node I to node I+1):

1. Create a lookup key by joining the two node identifiers with a hyphen
2. Search for this key in the corridor mapping
3. If not found, try the reverse order (node I+1 hyphen node I)
4. If found, add the corresponding corridor identifier to the corridor path
5. If not found, log a warning and use the node pair as a fallback identifier

### Duplicate Merging

After generating the corridor path, examine it for consecutive duplicate corridors:

- Traverse the corridor path sequentially
- If the current corridor is the same as the previous corridor, skip it
- This merges cases where the node path goes back and forth through the same corridor

### Example Conversion

**Node Path:** N_1, N_2, N_6, N_15, N_20

**Mapping Lookups:**
- Edge N_1 to N_2 maps to corridor C1
- Edge N_2 to N_6 maps to corridor C3
- Edge N_6 to N_15 maps to corridor C5
- Edge N_15 to N_20 maps to corridor C18

**Corridor Path:** C1, C3, C5, C18

## Phase 10: Results Publication

**Purpose:** Make computed paths available to dashboards and external systems via API endpoints.

### Output Data Structure

For each source node, the algorithm stores:

| Field | Description |
|-------|-------------|
| node_path | Ordered list of node identifiers from source to goal |
| corridor_path | Ordered list of corridor identifiers for navigation |
| goal_node | Identifier of the destination node |
| goal_type | Either "primary" or "secondary" |
| metrics | Object containing total risk, maximum occupancy, path length, and most dangerous segment |

### Global Output Fields

| Field | Description |
|-------|-------------|
| timestamp | Unix timestamp of when computation was performed |
| trigger | Reason for recomputation ("sensor_change" or "periodic") |
| available_goals | List of goal node identifiers that were considered safe |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /paths | GET | Returns complete path data including both node and corridor formats |
| /paths/nodes | GET | Returns only node-based paths (for debugging) |
| /paths/corridors | GET | Returns only corridor-based paths (for navigation systems) |
| /paths/metrics | GET | Returns detailed metrics for each path |
| /goals/status | GET | Returns safety status of all goal nodes |
| /status | GET | Returns system status and last update information |
| /health | GET | Basic health check for monitoring systems |

---

# Part 6: Main Execution Loop

## Complete Algorithm Flow

```
START

PHASE 1: SYSTEM INITIALIZATION
├── Load building graph and configuration
├── Define node categories (sources, primary goals, secondary goals)
├── Load corridor mapping
├── Initialize API server
├── Start background monitoring thread
└── Check system mode
    ├── If Passive Mode: Idle, wait for activation signal
    └── If Active Mode: Proceed to main loop

PHASE 2: MAIN MONITORING LOOP (Execute repeatedly while system is active)

    Step 1: Wait for INTERVAL seconds (default: 5 seconds)

    Step 2: Fetch current sensor data
    ├── Flame sensors (map to 0-100 percent)
    ├── Smoke sensors - MQ2 (map to 0-100 percent)
    ├── Temperature sensors (degrees Celsius)
    └── Occupancy sensors (people count per node)

    Step 3: Check if system mode changed to Passive
    └── If yes: Exit loop and stop algorithm

    Step 4: Check if sensor data is available
    └── If no data: Skip this cycle, continue to next iteration

    Step 5: Check if hazard values have changed
    ├── Compare flame, smoke, and temperature with previous values
    └── If no significant change: Skip recomputation, continue

    Step 6: Update risk maps for all nodes
    └── For each node: Calculate node risk using flame, smoke, temperature

    Step 7: Select available goals (Dynamic Goal Selection)
    ├── Stage 1: Evaluate primary goals (exits, safe rooms)
    ├── If none available: Stage 2 - Evaluate secondary goals (rooms)
    └── If still none: Trigger emergency alert, skip to next cycle

    Step 8: Prioritize source nodes (Source Prioritization)
    └── Sort sources by (Occupancy Ratio × 0.7 + Normalized Risk × 0.3)

    Step 9: Compute paths for each source node
    └── For each source in priority order (highest first):
        ├── Run core path routing algorithm
        ├── If path found:
        │   ├── Validate path endpoint type
        │   ├── If primary goal: Accept and compute metrics
        │   ├── If secondary goal: Reject (shelter only)
        │   ├── Generate corridor path from node path
        │   └── Store in results
        └── If no path found: Store NULL

    Step 10: Publish results
    ├── Store in global results structure with timestamp
    ├── Update trigger reason ("sensor_change")
    └── Make available via API endpoints

    Step 11: Update previous data cache
    └── Set previous sensor data = current sensor data

    Step 12: Continue to next iteration

END (when system is deactivated)
```

---

# Part 7: Algorithm Properties

## 7.1 Correctness Guarantees

| Property | Guarantee | Proof Outline |
|----------|-----------|---------------|
| Termination | The algorithm always terminates | Each node can be added to the Explored Set at most once. The number of nodes is finite. The loop always makes progress. |
| Completeness | If a safe path exists, the algorithm will find it | The algorithm explores all reachable nodes through safe edges. Goal checking is performed at every node expansion. |
| Optimality | The algorithm finds the minimum-cost path | Edge costs are non-negative. The heuristic is admissible (never overestimates). When a goal is popped from the Open Set, no better path can exist. |
| Safety | The algorithm never routes through hazardous nodes | Nodes with infinite risk are explicitly skipped during neighbor examination. No path can include a blocked node. |

## 7.2 Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Risk Calculation per node | Constant time O(1) | Constant space O(1) |
| Goal Selection | O(Number of primary goals + Number of secondary goals) | O(Number of primary goals + Number of secondary goals) |
| Source Prioritization | O(N log N) where N is number of source nodes | O(N) |
| Path Routing per source | O(E + V log V) where E is edges, V is vertices | O(V) |
| Total per Computation Cycle | O(N × (E + V log V)) | O(V + N) |

**Notation:**
- V = Number of nodes in the building graph
- E = Number of edges in the building graph
- N = Number of source nodes (occupied rooms)
- P = Number of primary goals (exits and safe rooms)
- S = Number of secondary goals (rooms and conference rooms)

## 7.3 Performance Expectations

| Metric | Expected Value for Typical Building |
|--------|-------------------------------------|
| Single path computation time | Under 100 milliseconds for graph with fewer than 100 nodes |
| Full cycle computation time (all sources) | Under 1 second for typical building |
| Memory usage | O(V), approximately few megabytes for typical building |
| Sensor sampling interval | 5 seconds (configurable) |
| Path update latency | Under 1 second from hazard change detection |

---

# Part 8: Output Specifications

## 8.1 Node-Based Path Output

**Format:** Ordered list of node identifiers

**Example:** N_1, N_2, N_6, N_15, N_20

**Use Case:** Backend processing, graph analysis, debugging

## 8.2 Corridor-Based Path Output

**Format:** Ordered list of corridor identifiers

**Example:** C1, C3, C5, C18

**Use Case:** Dashboard visualization, mobile navigation, wayfinding signage, turn-by-turn instructions

## 8.3 Path Metrics Output

**Format:** Object containing the following fields

| Field | Example Value |
|-------|---------------|
| total_risk | 12.5 |
| max_occupancy | 8 people |
| path_length | 5 nodes |
| most_dangerous_segment | Edge from N_6 to N_15 with risk 6.2 |

## 8.4 Complete Response Example

```json
{
  "timestamp": 1700000000,
  "trigger": "sensor_change",
  "available_goals": ["N_20", "N_11", "N_3", "N_19"],
  "paths": {
    "N_1": {
      "node_path": ["N_1", "N_2", "N_6", "N_15", "N_20"],
      "corridor_path": ["C1", "C3", "C5", "C18"],
      "goal_node": "N_20",
      "goal_type": "primary",
      "metrics": {
        "total_risk": 12.5,
        "max_occupancy": 8,
        "path_length": 5,
        "most_dangerous_segment": ["N_6", "N_15"]
      }
    },
    "N_5": {
      "node_path": ["N_5", "N_12", "N_13", "N_8", "N_7", "N_6", "N_15", "N_20"],
      "corridor_path": ["C6", "C11", "C9", "C4", "C5", "C7", "C18"],
      "goal_node": "N_20",
      "goal_type": "primary",
      "metrics": {
        "total_risk": 18.3,
        "max_occupancy": 12,
        "path_length": 8,
        "most_dangerous_segment": ["N_7", "N_6"]
      }
    }
  }
}
```

---

# Part 9: Error Handling and Edge Cases

## 9.1 Sensor Failures

| Scenario | Algorithm Behavior |
|----------|-------------------|
| No sensor data available for any node | Assume zero risk for all nodes, use distance-only routing |
| Missing data for specific node | Assume zero risk for that node, log warning |
| Sensor values out of expected range | Clamp to valid range (0-100 percent for flame/smoke, reasonable temperature range) |
| Occupancy sensor failure | Assume zero occupancy penalty for that node |

## 9.2 Graph Issues

| Scenario | Algorithm Behavior |
|----------|-------------------|
| Disconnected graph (no path possible) | Heuristic falls back to minimum edge estimation, routing will correctly fail |
| Missing corridor mapping for edge | Log error, use node pair as fallback identifier in output |
| Duplicate edges in graph | Keep the smallest edge weight (shortest distance) |
| Node with no edges (isolated) | Mark as impossible to evacuate, return NULL for any source that is isolated |

## 9.3 Goal Availability Issues

| Scenario | Algorithm Behavior |
|----------|-------------------|
| All primary goals blocked, secondary goals available | Use secondary goals as destinations, mark paths as shelter-only |
| All primary and secondary goals blocked | Trigger emergency alert, all sources marked as no route available |
| Goals exist but are unreachable from some sources | Those sources receive NULL path; other sources route normally |
| Goal becomes blocked during routing | Not possible (goals selected before routing starts) |

## 9.4 Occupancy Edge Cases

| Scenario | Algorithm Behavior |
|----------|-------------------|
| Room capacity is zero or undefined | Assume capacity of 1 person, treat as easily congested |
| People count exceeds capacity | Cap occupancy ratio at 1.0 for penalty calculation |
| Negative occupancy value | Treat as zero, log warning |
| Floor area not provided for density calculation | Use people count alone for penalty (count / capacity method) |

## 9.5 Risk Calculation Edge Cases

| Scenario | Algorithm Behavior |
|----------|-------------------|
| Multiple sensors indicate blocking condition | Any single condition triggers block (OR logic) |
| Risk value exceeds practical maximum | Cap at large finite value for normalization purposes |
| Temperature exactly at threshold | Below threshold: safe; at or above threshold: apply penalty/block as specified |
| Flame percentage exactly 0 | Treat as no flame risk |

---

# Part 10: Special Considerations

## 10.1 Indian Climatic Context

The temperature thresholds in this algorithm are specifically calibrated for Indian conditions based on the following justifications:

| Threshold | Justification |
|-----------|---------------|
| 45 degrees Celsius as safe baseline | Indian Meteorological Department defines heat wave when temperature exceeds 45 degrees Celsius. Below this is considered normal summer temperature. |
| 50 degrees Celsius as low risk | At 45 to 50 degrees Celsius, evacuation is possible but causes heat stress. Many Indian cities routinely experience these temperatures during summer months. |
| 55 degrees Celsius as medium risk | At 50 to 55 degrees Celsius, exposure should be limited to under 30 minutes. Emergency evacuation is still feasible. |
| 60 degrees Celsius as block | Above 60 degrees Celsius, human survival time is under 10 minutes. The node is considered impassable for evacuation purposes. |

**Source References:** Indian heat wave guidelines, NFPA 130 (adjusted for tropical climate), physiological studies on heat tolerance in South Asian populations.

## 10.2 Occupancy Density Considerations

Indian public spaces often experience higher densities than Western standards. The occupancy thresholds are adjusted accordingly:

| Density | Indian Context |
|---------|----------------|
| 2 to 4 people per square meter | Normal for markets, busy corridors, temple premises |
| 4 to 6 people per square meter | Common during rush hours, festival gatherings |
| Above 6 people per square meter | Stampede risk level, treated as critical |

Blocking at lower densities (such as 3 people per square meter) would make the algorithm unusable in real Indian conditions.

## 10.3 Real-Time Performance Considerations

| Consideration | Implementation Approach |
|---------------|------------------------|
| Computational load | Event-driven recomputation (only on hazard change) prevents unnecessary cycles |
| Memory usage | Only store current risk map and occupancy data; discard intermediate results after cycle |
| Concurrent access | Use thread-safe data structures for shared results between computation thread and API thread |
| Dashboard latency | Publish results immediately after computation; API serves cached results until next update |

---

# Part 11: Summary

## 11.1 Algorithm Summary Table

| Aspect | Description |
|--------|-------------|
| Name | Dynamic Risk-Aware Path Routing Algorithm |
| Purpose | Real-time evacuation path computation during building emergencies |
| Input | Building graph, sensor data (flame, smoke, temperature, occupancy) |
| Output | Node-based paths, corridor-based paths, path metrics |
| Trigger | Event-driven (hazard changes) |
| Goal Selection | Primary goals first (exits, safe rooms); fallback to secondary goals (rooms) |
| Cost Function | Distance + average risk + occupancy penalty |
| Optimality | Guaranteed optimal (minimum cost) due to admissible heuristic |
| Complexity | O(N × (E + V log V)) per cycle |
| Target Environment | Indian building conditions (higher temperature tolerance, higher occupancy densities) |

## 11.2 Key Thresholds Summary

| Sensor | Safe | Low Risk | Medium Risk | High Risk | Blocked |
|--------|------|----------|-------------|-----------|---------|
| Flame (%) | 0 | 1-10 | 10-20 | 20-40 | > 40 |
| Smoke (%) | < 10 | 10-20 | 20-40 | 40-60 | > 60 |
| Temp (°C) | < 45 | 45-50 | 50-55 | 55-60 | > 60 |
| Occupancy (p/m²) | < 1.0 | 1.0-2.0 | 2.0-4.0 | 4.0-6.0 | > 6.0 |

## 11.3 Algorithm Strengths

- **Adaptive:** Responds in real-time to changing environmental conditions
- **Safe:** Never routes through hazardous nodes
- **Optimal:** Finds minimum-cost paths
- **Practical:** Thresholds calibrated for real-world Indian conditions
- **Efficient:** Event-driven recomputation minimizes computational load
- **Navigable:** Corridor-based output enables direct integration with wayfinding systems

---

# Document End

This document provides the complete specification of the Dynamic Risk-Aware Path Routing Algorithm. No implementation code is included. All definitions, formulas, decision rules, and architectural descriptions are presented in pure algorithmic form suitable for academic documentation and IEEE paper submission.