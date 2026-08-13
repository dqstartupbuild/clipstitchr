import { describe, expect, it } from "vitest";
import { rateLimiter } from "../rateLimiter";

describe("Studio Clips rate-limit configuration", () => {
  it("defines owner and sharded global budgets before user and worker costs", () => {
    expect(rateLimiter.limits?.studioClipsTaskCreate).toMatchObject({
      capacity: 6,
      rate: 24,
    });
    expect(rateLimiter.limits?.studioClipsTaskCreateGlobal).toMatchObject({
      capacity: 100,
      rate: 1_000,
      shards: 5,
    });
    expect(rateLimiter.limits?.studioClipsCostStage).toMatchObject({
      capacity: 10,
      rate: 60,
    });
    expect(rateLimiter.limits?.studioClipsCostStageGlobal).toMatchObject({
      capacity: 200,
      rate: 2_000,
      shards: 5,
    });
  });
});
