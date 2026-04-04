import { pool } from "../config/db.js";

export const insertLog = async (log) => {
  await pool.query(
    `INSERT INTO logs 
    (system_id, floor_id, system_mode, timestamp, source, occupancy, evacuation, nodes, meta)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      log.system_id,
      log.floor_id,
      log.system_mode,
      log.timestamp,
      log.source,
      log.occupancy,
      log.evacuation,
      log.nodes,
      log.meta,
    ],
  );
};
