# Sensor Value Generator Module

SAFE System

***


# 1. Overview

The **sensor\_value\_generator** module simulates telemetry data for the SAFE evacuation system. It allows controlled generation of sensor data before integrating physical hardware.

The module contains two components:

- **Frontend** – Interface for adjusting simulated node parameters.

- **Backend** – API service that receives and stores the latest telemetry snapshot.

The frontend allows adjustment of the following parameters for each node:

- Flame

- Smoke

- Temperature

- People Count

The frontend continuously publishes telemetry snapshots to the backend.\
The backend stores the most recent snapshot and exposes it through API endpoints for other system components.

***


# 2. System Architecture

    sensor_value_generator
    │
    ├── frontend
    │   ├── Components
    │   │   ├── Button.jsx
    │   │   └── Slider.jsx
    │   │
    │   ├── Hooks
    │   │   └── useDataSender.js
    │   │
    │   ├── assets
    │   │   └── layout_v1.png
    │   │
    │   ├── .env.local
    │   ├── .env.lan
    │   ├── .env.cloud
    │   │
    │   └── App.jsx
    │
    └── backend
        └── server.js

The **frontend generates telemetry**.\
The **backend stores and exposes the latest system snapshot**.

***


# 3. Backend Service

File:

    backend/server.js


## Purpose

The backend receives telemetry payloads from the frontend and maintains the most recent system snapshot in memory.

It exposes endpoints that allow other SAFE system components to read the latest telemetry state.

No database or persistent storage is used.

***


# 4. Backend Responsibilities

The backend performs the following tasks:

- Accept telemetry payloads from the frontend.

- Store the latest node snapshot in memory.

- Track the time of the most recent update.

- Detect stale telemetry data.

- Provide endpoints for system controllers and monitoring tools.

***


# 5. Telemetry Timeout

The backend defines a timeout window:

    DATA_TIMEOUT_MS = 15000

If no telemetry update is received within this time window, the system marks the data as stale.

This prevents system logic from operating on outdated sensor data.

***


# 6. Backend API Endpoints

## POST /data/nodes

Receives telemetry payloads from the frontend.

Example payload:

    {
      "systemId": "SAFE-FLOOR-1",
      "floorId": "floor-1",
      "timestamp": "...",
      "nodes": {
        "N_1": {...},
        "N_2": {...},
        ...
        "N_20": {...}
      }
    }

The backend stores this payload as the latest snapshot.

***


## GET /data/nodes

Returns the most recent telemetry payload received by the backend.

If no data has been received yet, a message indicating this condition is returned.

***


## GET /state

Provides the current system state used by the ESP or Raspberry Pi controller.

Response includes:

- latest node telemetry

- timeout status

- timestamp of the last update

***


## GET /health

Returns a simple health report containing:

- service status

- telemetry availability

- timeout state

- server uptime

***


# 7. Frontend Control Panel

File:

    frontend/App.jsx


## Purpose

The frontend provides an interface to simulate sensor values for each node.

Users can:

- select a location

- select a node within that location

- modify sensor values

- continuously publish telemetry data

***


# 8. Node Layout

Nodes are grouped according to building locations.

Locations include:

- Room

- Corridor

- Conference Room

- Safe Room

- Exits

Each location contains a predefined set of nodes.

Nodes follow the identifier format:

    N_1 → N_20

***


# 9. Sensor Parameters

Each node exposes four parameters.

| Parameter    | Description               |
| ------------ | ------------------------- |
| Flame        | Flame detection level     |
| Smoke        | Smoke density             |
| Temperature  | Ambient temperature       |
| People Count | Number of people detected |

These parameters are modified using slider controls in the UI.

***


# 10. Telemetry Publishing

File:

    frontend/Hooks/useDataSender.js


## Purpose

This hook sends telemetry data from the frontend to the backend.

The hook runs automatically when the application is active.

***


## Transmission Interval

Telemetry snapshots are transmitted every:

    5000 milliseconds

The full node snapshot is sent regardless of whether any value has changed.

***


## Payload Structure

Each transmission includes:

- system metadata

- timestamp

- occupancy summary

- node sensor values

Example node structure:

    "N_5": {
      "flame": 10,
      "smoke": 15,
      "temperature": 30,
      "people_count": 12,
      "curr_people_count": "N/A"
    }

***


# 11. Environment Configuration

The frontend uses environment variables to determine which backend endpoint will receive telemetry.

Environment variables are defined using separate `.env` files.

***


## Environment Files

    .env.local

Used for local development.

    VITE_SAFE_API_BASE=http://localhost:5000/data
    VITE_SYSTEM_ID=SAFE-FLOOR-1
    VITE_FLOOR_ID=floor-1

Telemetry is sent to the locally running backend server.

***

    .env.lan

Used when testing with the Raspberry Pi or another device on the same network.

    VITE_SAFE_API_BASE=http://192.168.4.1:8080/data
    VITE_SYSTEM_ID=SAFE-FLOOR-1
    VITE_FLOOR_ID=floor-1

Telemetry is sent directly to the LAN controller.

***

    .env.cloud

Used when telemetry needs to be accessible remotely.

    VITE_SAFE_API_BASE=https://safe-0vvn.onrender.com/data
    VITE_SYSTEM_ID=SAFE-FLOOR-1
    VITE_FLOOR_ID=floor-1

Telemetry is sent to the cloud backend.

***


# 12. Running the Module

## Start Backend

Navigate to the backend directory:

    cd backend

Install dependencies:

    npm install

Start the backend server:

    node server.js

Backend will run on:

    http://localhost:5000

***


## Start Frontend

Navigate to the frontend directory:

    cd frontend

Install dependencies:

    npm install

***


# 13. Selecting Environment Mode

The frontend uses Vite environment modes to select the appropriate configuration file.

***


## Local Development

Uses `.env.local`.

    npm run dev

Telemetry is sent to the local backend.

***


## LAN Mode

Uses `.env.lan`.

    npm run dev:lan

Telemetry is sent to the LAN device.

***


## Cloud Mode

Uses `.env.cloud`.

    npm run dev:cloud

Telemetry is sent to the cloud backend.

***


# 14. Development Workflow

1. Start the backend server.

2. Start the frontend in the required environment mode.

3. Open the SAFE Node Control Panel in the browser.

4. Adjust node parameters.

5. Telemetry snapshots are transmitted every 5 seconds.

***


# 15. Role in SAFE System

The sensor value generator is a development and testing tool used during system integration.

It allows simulation of sensor networks and verification of telemetry pipelines before physical hardware is connected.

The module enables validation of evacuation algorithms, system monitoring, and controller logic during development.
