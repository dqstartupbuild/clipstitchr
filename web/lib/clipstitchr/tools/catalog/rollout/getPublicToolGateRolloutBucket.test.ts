import { describe, expect, it } from "vitest";
import { getPublicToolGateRolloutBucket } from "@/lib/clipstitchr/tools/catalog/rollout/getPublicToolGateRolloutBucket";

describe("getPublicToolGateRolloutBucket", () => {
  it("returns one stable basis-point bucket for an opaque visitor key", () => {
    const first = getPublicToolGateRolloutBucket("visitor_opaque_123");
    const second = getPublicToolGateRolloutBucket("visitor_opaque_123");

    expect(first).toBe(second);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(10_000);
    expect(getPublicToolGateRolloutBucket("visitor_opaque_456")).not.toBe(
      first,
    );
  });
});
