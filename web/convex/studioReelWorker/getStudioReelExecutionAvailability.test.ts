import { afterEach, describe, expect, it } from "vitest";
import { getStudioReelExecutionAvailability } from "./getStudioReelExecutionAvailability";

const originalStudioEnabled = process.env.STUDIO_BETA_ENABLED;
const originalExecutionEnabled = process.env.STUDIO_STITCH_EXECUTION_ENABLED;
const originalSecret = process.env.STUDIO_STITCH_WORKER_SECRET;

afterEach(() => {
  if (originalStudioEnabled === undefined) delete process.env.STUDIO_BETA_ENABLED;
  else process.env.STUDIO_BETA_ENABLED = originalStudioEnabled;
  if (originalExecutionEnabled === undefined)
    delete process.env.STUDIO_STITCH_EXECUTION_ENABLED;
  else process.env.STUDIO_STITCH_EXECUTION_ENABLED = originalExecutionEnabled;
  if (originalSecret === undefined)
    delete process.env.STUDIO_STITCH_WORKER_SECRET;
  else process.env.STUDIO_STITCH_WORKER_SECRET = originalSecret;
});

describe("getStudioReelExecutionAvailability", () => {
  it("requires both exact kill switches and a strong distinct secret", () => {
    process.env.STUDIO_BETA_ENABLED = "true";
    process.env.STUDIO_STITCH_EXECUTION_ENABLED = "true";
    process.env.STUDIO_STITCH_WORKER_SECRET = "s".repeat(32);

    expect(getStudioReelExecutionAvailability()).toEqual({
      reason: null,
      state: "configured",
    });

    process.env.STUDIO_BETA_ENABLED = "false";
    expect(getStudioReelExecutionAvailability()).toEqual({
      reason: "Studio Beta is disabled.",
      state: "unavailable",
    });

    process.env.STUDIO_BETA_ENABLED = "true";
    process.env.STUDIO_STITCH_WORKER_SECRET = "weak";
    expect(getStudioReelExecutionAvailability()).toMatchObject({
      state: "unavailable",
    });
  });
});
