export const formatLog = (nodeData, pathData) => {
  const now = new Date();

  // Calculate latency
  const eventTime = new Date(nodeData.timestamp);
  const receivedTime = new Date(nodeData.receivedAt || now);
  const latency = receivedTime - eventTime;

  // Active path nodes
  const activePathNodes = pathData[nodeData.activeEvacuationPathId] || [];

  return {
    // ---------------- SYSTEM ----------------
    system_id: nodeData.systemId,
    floor_id: nodeData.floorId,
    system_mode: nodeData.systemMode,
    timestamp: nodeData.timestamp,
    received_at: nodeData.receivedAt,

    // ---------------- SOURCE ----------------
    source: {
      ...nodeData.source,
      ingestion_time: now.toISOString(),
    },

    // ---------------- OCCUPANCY ----------------
    occupancy: {
      people_before: nodeData.occupancy?.people_count_before_switching,
      current_people: nodeData.occupancy?.curr_people_count,
    },

    // ---------------- EVACUATION ----------------
    evacuation: {
      active_path_id: nodeData.activeEvacuationPathId,
      active_path_nodes: activePathNodes,
      full_path_map: pathData,
      path_length: activePathNodes.length,
    },

    // ---------------- NODES ----------------
    nodes: nodeData.nodes,

    // ---------------- ANALYTICS ----------------
    meta: {
      total_nodes: Object.keys(nodeData.nodes || {}).length,
      system_status: nodeData.systemMode === "ACTIVE" ? "EMERGENCY" : "NORMAL",
      latency_ms: latency,
      has_valid_path: activePathNodes.length > 0,
    },
  };
};
