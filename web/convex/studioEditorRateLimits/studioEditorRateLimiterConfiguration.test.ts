import { describe, expect, it } from "vitest";
import { rateLimiter } from "../rateLimiter";

describe("Studio editor rate-limit configuration", () => {
  it("defines bounded owner and sharded global budgets for writes and static reads", () => {
    expect(rateLimiter.limits?.studioEditorProjectWrite).toMatchObject({
      rate: 600,
      capacity: 120,
    });
    expect(rateLimiter.limits?.studioEditorProjectWriteGlobal).toMatchObject({
      rate: 20_000,
      capacity: 3_000,
      shards: 5,
    });
    expect(rateLimiter.limits?.studioEditorStaticRead).toMatchObject({
      rate: 600,
      capacity: 120,
    });
    expect(rateLimiter.limits?.studioEditorStaticReadGlobal).toMatchObject({
      rate: 20_000,
      capacity: 3_000,
      shards: 5,
    });
  });
});
