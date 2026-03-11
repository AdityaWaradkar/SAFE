// Node → Location mapping for SAFE dashboard

export const NODE_LOCATIONS = {
  Room: ["N_1", "N_14", "N_8", "N_13", "N_18"],

  Corridor: [
    "N_2",
    "N_6",
    "N_15",
    "N_16",
    "N_17",
    "N_12",
    "N_9",
    "N_10",
    "N_5",
  ],

  "Conference Room": ["N_4", "N_7"],

  "Safe Room": ["N_19"],

  Exits: ["N_20", "N_11", "N_3"],
};

/*
Helper function:
Return location type of a node
Example:
getNodeLocation("N_1") → "Room"
*/

export function getNodeLocation(nodeId) {
  for (const [location, nodes] of Object.entries(NODE_LOCATIONS)) {
    if (nodes.includes(nodeId)) {
      return location;
    }
  }

  return "Unknown";
}

/*
Helper function:
Return only nodes that represent rooms (ignore corridors)
*/

export function getRoomNodes() {
  return [
    ...NODE_LOCATIONS.Room,
    ...NODE_LOCATIONS["Conference Room"],
    ...NODE_LOCATIONS["Safe Room"],
  ];
}
