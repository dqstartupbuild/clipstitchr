import { describe, expect, it } from "vitest";
import { getUpgradeAllowanceDelta } from "./getUpgradeAllowanceDelta";

describe("getUpgradeAllowanceDelta", () => {
  it("prorates only the paid incremental credits and expands videos immediately", () => {
    expect(
      getUpgradeAllowanceDelta({
        currentPlanKey: "starter",
        nextPlanKey: "pro",
        now: "2026-01-08T12:00:00.000Z",
        periodEnd: "2026-01-31T00:00:00.000Z",
        periodStart: "2026-01-01T00:00:00.000Z",
      }),
    ).toEqual({
      aiVideos: 7,
      creationCredits: 4_500,
    });
  });

  it("does not grant incremental allowances for a downgrade", () => {
    expect(
      getUpgradeAllowanceDelta({
        currentPlanKey: "pro",
        nextPlanKey: "starter",
        now: "2026-01-08T12:00:00.000Z",
        periodEnd: "2026-01-31T00:00:00.000Z",
        periodStart: "2026-01-01T00:00:00.000Z",
      }),
    ).toEqual({
      aiVideos: 0,
      creationCredits: 0,
    });
  });
});
