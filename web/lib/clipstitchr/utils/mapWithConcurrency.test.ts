import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "@/lib/clipstitchr/utils/mapWithConcurrency";

describe("mapWithConcurrency", () => {
  it("preserves result order while limiting active work", async () => {
    let activeWorkers = 0;
    let maxActiveWorkers = 0;

    const results = await mapWithConcurrency([1, 2, 3, 4], 2, async (value) => {
      activeWorkers += 1;
      maxActiveWorkers = Math.max(maxActiveWorkers, activeWorkers);
      await Promise.resolve();
      activeWorkers -= 1;
      return value * 10;
    });

    expect(results).toEqual([10, 20, 30, 40]);
    expect(maxActiveWorkers).toBeLessThanOrEqual(2);
  });
});
