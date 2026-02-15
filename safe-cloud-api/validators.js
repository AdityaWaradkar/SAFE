import { z } from "zod";

/**
 * Base schema for any monitored zone
 * (room, corridor, conference A/B, safeRoom)
 */
export const zoneTelemetrySchema = z.object({
  flame: z.number(),
  smoke: z.number(),
  temperature: z.number(),
  people_count: z.number().optional(),
  curr_people_count: z.union([z.number(), z.string()]).optional(),
});

/**
 * Telemetry payload schema (from ESP / RPi)
 */
export const telemetrySchema = z.object({
  systemId: z.string(),
  floorId: z.string(),
  systemMode: z.string(),
  timestamp: z.string(),

  source: z.object({
    deviceType: z.string(),
    deviceId: z.string(),
  }),

  activeEvacuationPathId: z.string().optional(),

  occupancy: z
    .object({
      people_count_before_switching: z.number().optional(),
      curr_people_count: z.union([z.number(), z.string()]).optional(),
    })
    .optional(),

  rooms: z.record(z.string(), zoneTelemetrySchema).optional(),

  corridors: z.record(z.string(), zoneTelemetrySchema).optional(),

  conferenceRoom: z
    .object({
      A: zoneTelemetrySchema,
      B: zoneTelemetrySchema,
    })
    .optional(),
});

/**
 * Path computation schema (A* output)
 */
export const pathSchema = z.object({
  systemId: z.string(),
  floorId: z.string(),
  pathId: z.string(),
  startZone: z.string(),
  exitId: z.string(),
  pathSegments: z.array(z.string()),
  cost: z.number().optional(),
  timestamp: z.string(),
});
