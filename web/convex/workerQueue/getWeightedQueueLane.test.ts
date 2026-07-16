import { describe, expect, it } from "vitest";
import { getWeightedQueueLane } from "./getWeightedQueueLane";
import { updateWorkerQueueDeficits } from "./updateWorkerQueueDeficits";

describe("weighted worker queue lanes", () => {
  it("serves available lanes in a 1:3:5 weighted cycle", () => {
    let deficits = { agency: 0, pro: 0, starter: 0 };
    const counts = { agency: 0, pro: 0, starter: 0 };

    for (let index = 0; index < 90; index += 1) {
      const lane = getWeightedQueueLane({
        availableLanes: ["starter", "pro", "agency"],
        deficits,
        laneQueuedAt: {},
        now: "2026-07-15T00:00:00.000Z",
      });

      expect(lane).toBeDefined();
      counts[lane!] += 1;
      deficits = updateWorkerQueueDeficits(
        deficits,
        ["starter", "pro", "agency"],
        lane!,
      );
    }

    expect(counts).toEqual({ agency: 50, pro: 30, starter: 10 });
  });

  it("ages Starter and Pro into service", () => {
    expect(
      getWeightedQueueLane({
        availableLanes: ["starter", "pro", "agency"],
        deficits: { agency: 100, pro: 0, starter: 0 },
        laneQueuedAt: {
          starter: "2026-07-15T00:00:00.000Z",
          pro: "2026-07-15T00:02:00.000Z",
        },
        now: "2026-07-15T00:05:00.000Z",
      }),
    ).toBe("starter");
    expect(
      getWeightedQueueLane({
        availableLanes: ["pro", "agency"],
        deficits: { agency: 100, pro: 0, starter: 0 },
        laneQueuedAt: { pro: "2026-07-15T00:02:00.000Z" },
        now: "2026-07-15T00:05:00.000Z",
      }),
    ).toBe("pro");
  });
});
