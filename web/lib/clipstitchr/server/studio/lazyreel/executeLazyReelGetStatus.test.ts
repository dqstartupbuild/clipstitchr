import { describe, expect, it } from "vitest";
import { executeLazyReelGetStatus } from "./executeLazyReelGetStatus";

describe("executeLazyReelGetStatus", () => {
  it("reports counts without exposing tokens or prefixes", () => {
    process.env.LAZYREEL_TOKEN = "super-secret-value";
    const result = executeLazyReelGetStatus();
    const serialized = JSON.stringify(result);

    expect(result.data.liveTools).toHaveLength(7);
    expect(result.data.workflows).toHaveLength(6);
    expect(result.data.counts.exampleLinks).toBe(418);
    expect(serialized).not.toContain("super-secret-value");
    expect(serialized).not.toContain("super-sec");
    delete process.env.LAZYREEL_TOKEN;
  });
});
