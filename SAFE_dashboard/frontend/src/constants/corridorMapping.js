// constants/corridorMapping.js
export const CORRIDOR_MAPPING = {
  // Format: "NodeA-NodeB": "CorridorId"

  // Example mappings based on your SVG node structure
  // You'll need to define all the connections between nodes
  "N_1-N_2": "C1", // Path between nodes 1 and 2 uses corridor C1
  "N_2-N_6": "C3", // Path between nodes 2 and 6 uses corridor C3
  "N_2-N_15": "C7", // Path between nodes 2 and 15 uses corridor C7
  "N_14-N_15": "C13", // Path between nodes 14 and 15 uses corridor C13
  "N_15-N_18": "C14", // Path between nodes 15 and 18 uses corridor C14
  "N_15-N_20": "C18", // Path between nodes 15 and 20 uses corridor C18
  "N_18-N_19": "C19", // Path between nodes 18 and 19 uses corridor C19
  "N_5-N_9": "C2", // Path between nodes 5 and 9 uses corridor C2
  "N_5-N_12": "C6", // Path between nodes 5 and 12 uses corridor C6
  "N_12-N_13": "C11", // Path between nodes 12 and 13 uses corridor C11
  "N_8-N_10": "C8", // Path between nodes 8 and 10 uses corridor C8
  "N_8-N_13": "C9", // Path between nodes 8 and 13 uses corridor C9
  "N_10-N_11": "C10", // Path between nodes 10 and 11 uses corridor C10
  "N_4-N_7": "C17", // Path between nodes 4 and 7 uses corridor C17
  "N_7-N_8": "C4", // Path between nodes 7 and 8 uses corridor C4
  "N_16-N_17": "C15", // Path between nodes 16 and 17 uses corridor C15
  "N_17-N_19": "C16", // Path between nodes 17 and 19 uses corridor C16
};
