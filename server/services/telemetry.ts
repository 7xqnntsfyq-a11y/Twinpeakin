import { db } from "../db/index";
import { telemetry } from "../db/schema";
import { eq } from "drizzle-orm";

export class TelemetryService {
  static async incrementRuntimeStart(): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(telemetry)
        .where(eq(telemetry.eventType, "runtime_start"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(telemetry)
          .set({
            instanceCount: existing[0].instanceCount + 1,
            lastIncrement: new Date(),
          })
          .where(eq(telemetry.eventType, "runtime_start"));
      } else {
        await db.insert(telemetry).values({
          eventType: "runtime_start",
          instanceCount: 1,
        });
      }
    } catch (error) {
      console.error("Telemetry error (non-blocking):", error);
    }
  }

  static async getInstanceCount(): Promise<number> {
    try {
      const result = await db
        .select()
        .from(telemetry)
        .where(eq(telemetry.eventType, "runtime_start"))
        .limit(1);

      return result.length > 0 ? result[0].instanceCount : 0;
    } catch (error) {
      console.error("Telemetry error (non-blocking):", error);
      return 0;
    }
  }
}
