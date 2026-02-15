import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { telemetrySchema, pathSchema } from "./validators.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * TELEMETRY ENDPOINT
 */
app.post("/api/telemetry", async (req, res) => {
  try {
    const parsed = telemetrySchema.parse(req.body);

    const {
      systemId,
      floorId,
      systemMode,
      timestamp,
      source,
      activeEvacuationPathId,
      rooms,
      corridors,
      conferenceRoom,
    } = parsed;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const insertQuery = `
        INSERT INTO telemetry_logs
        (
          system_id,
          floor_id,
          device_id,
          device_type,
          system_mode,
          evacuation_path_id,
          zone_type,
          zone_name,
          flame,
          smoke,
          temperature,
          people_count,
          timestamp
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `;

      const insertZone = async (zoneType, zoneName, data) => {
        await client.query(insertQuery, [
          systemId,
          floorId,
          source.deviceId,
          source.deviceType,
          systemMode,
          activeEvacuationPathId || null,
          zoneType,
          zoneName,
          data.flame,
          data.smoke,
          data.temperature,
          data.people_count ?? null,
          timestamp,
        ]);
      };

      if (rooms) {
        for (const [name, data] of Object.entries(rooms)) {
          await insertZone("room", name, data);
        }
      }

      if (corridors) {
        for (const [name, data] of Object.entries(corridors)) {
          await insertZone("corridor", name, data);
        }
      }

      if (conferenceRoom) {
        for (const [name, data] of Object.entries(conferenceRoom)) {
          await insertZone("conference", name, data);
        }
      }

      await client.query("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Telemetry transaction failed:", err);
      res.status(500).json({ error: "Database error" });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

/**
 * PATH ENDPOINT
 */
app.post("/api/path", async (req, res) => {
  try {
    const parsed = pathSchema.parse(req.body);

    const {
      systemId,
      floorId,
      pathId,
      startZone,
      exitId,
      pathSegments,
      cost,
      timestamp,
    } = parsed;

    await pool.query(
      `
      INSERT INTO path_logs
      (
        system_id,
        floor_id,
        path_id,
        start_zone,
        exit_id,
        path_segments,
        cost,
        timestamp
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        systemId,
        floorId,
        pathId,
        startZone,
        exitId,
        JSON.stringify(pathSegments),
        cost ?? null,
        timestamp,
      ],
    );

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

/**
 * HEALTH CHECK
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Cloud API running on port ${PORT}`);
});
