# Dynamic Risk-Aware A\* Path Planning System

## Complete Technical Documentation (With Proper Mathematical Equations)

***


## 1. Introduction

This document describes the complete mathematical and algorithmic foundation of the A\* (A-Star) pathfinding algorithm adapted for a dynamic fire-evacuation system.

The objective of the system is:

> To compute the safest path from every room in a building to the nearest safe destination (exit or safe room), using real-time sensor data.

The algorithm runs periodically (for example, every 5 seconds), updates risk values based on sensors, and produces optimal evacuation paths.

***


# 2. Graph Model of the Building

The building floor is modeled as a weighted graph:

G=(V,E)

Where:

- V = set of nodes (rooms, corridor junctions, exits, safe rooms)

- E = set of edges (walkable connections)

Each edge (u,v)∈E has a base distance:

D(u,v)

Each node v∈V has:

- Coordinates (xv​,yv​)

- Sensor values

- Computed risk value R(v)

The graph structure is static. Only risk values change over time.

***


# 3. Sensor Inputs

Each node contains real-time sensor data:

- Flame percentage: F(v)∈\[0,100]

- Smoke percentage: S(v)∈\[0,100]

- Temperature in °C: T(v)

***


# 4. Risk Function

Risk is computed per node.


## 4.1 Hard Safety Cutoff

If flame exceeds a critical threshold:

If F(v)>Fcritical​,R(v)=∞

This represents physically impassable conditions.

***


## 4.2 Continuous Risk Model

If flame is below critical threshold:

R(v)=αS(v)+βmax(0,T(v)−Tsafe​)+γF(v)

Where:

- α = smoke weight

- β = temperature weight

- γ = flame weight

- Tsafe​ = safe temperature threshold

The term:

max(0,T(v)−Tsafe​)

ensures that temperature contributes only when above safe level.

***


# 5. Objective of A\*

A\* minimizes the evaluation function:

f(n)=g(n)+h(n)

Where:

- g(n) = accumulated cost from start to node n

- h(n) = estimated remaining cost to goal

***


# 6. Accumulated Cost g(n)

For a transition from node u to node v:

g(v)=g(u)+D(u,v)+R(v)

This means:

- Add physical distance

- Add risk cost of entering node

- Add previously accumulated cost

Therefore total path cost equals:

g(n)=∑D(ui​,ui+1​)+∑R(ui+1​)

The cost accumulates across the entire path.

This accumulation is essential. Without it, the algorithm becomes greedy and incorrect.

***


# 7. Heuristic Function h(n)

The heuristic estimates remaining distance to goal.

We use Euclidean distance:

h(n)=g∈Gmin​(xn​−xg​)2+(yn​−yg​)2​

Where:

- G = set of goal nodes (exits, safe rooms)

This heuristic is:

- Admissible (never overestimates true distance)

- Independent of dynamic risk

- Ensures optimality

Risk is never included in heuristic.

***


# 8. Complete A\* Algorithm

## 8.1 Data Structures

Two main sets:

- Open Set: nodes discovered but not fully explored

- Closed Set: nodes already expanded

Each node maintains:

- g(n)

- f(n)

- Parent pointer

***


## 8.2 Initialization

Given start node s:

g(s)=0 f(s)=h(s)

Open Set = { s }\
Closed Set = ∅

***


## 8.3 Main Loop

While Open Set is not empty:

1. Select node u in Open Set with minimum f(u)

2. Remove u from Open Set

3. Add u to Closed Set

If u is a goal node, terminate.

***


## 8.4 Neighbor Expansion

For each neighbor v of u:

If v∈Closed Set, skip.

Compute tentative cost:

gtentative​=g(u)+D(u,v)+R(v)

If v∈/Open Set:

- Add v to Open Set

- Set parent(v) = u

- Set g(v)=gtentative​

Else if:

gtentative​\<g(v)

Then:

- Update g(v)

- Update parent(v) = u

Finally compute:

f(v)=g(v)+h(v)

Repeat loop.

***


# 9. Termination Condition

The algorithm stops when the goal node is removed from the Open Set.

At that moment:

g(goal)=minimum possible total cost

The optimal path has been found.

***


# 10. Path Reconstruction

To reconstruct path:

1. Start from goal node.

2. Follow parent pointers backward:

goal→parent(goal)→⋯→start

3. Reverse sequence.

Final output:

Ordered list of nodes from start to goal.

***


# 11. Multiple Start Nodes (Evacuation System)

In your evacuation system:

For every room ri​∈V:

Run A\* with:

- Start = ri​

- Goals = exits ∪ safe rooms

This produces:

Pathri​​

One optimal evacuation path per room.

***


# 12. System Execution Cycle

Every 5 seconds:

1. Collect sensor data.

2. Compute R(v) for all nodes.

3. Update cost structure.

4. For each room:

   - Run A\*

   - Store path

5. Convert paths to LED instructions.

6. Send commands to ESP modules.

***


# 13. Complete Mathematical Summary

Risk:

R(v)={∞,αS(v)+βmax(0,T(v)−Tsafe​)+γF(v),​F(v)>Fcritical​otherwise​

Accumulated cost:

g(v)=g(u)+D(u,v)+R(v)

Heuristic:

h(n)=g∈Gmin​(xn​−xg​)2+(yn​−yg​)2​

Evaluation:

f(n)=g(n)+h(n)

Optimization objective:

minf(n)

***


# 14. Final Outcome

The algorithm outputs:

An ordered sequence of node IDs representing the safest evacuation path.

This path:

- Minimizes total travel distance

- Minimizes smoke exposure

- Minimizes flame exposure

- Minimizes temperature exposure

- Avoids critical flame zones

- Adapts dynamically to changing hazard conditions

***
