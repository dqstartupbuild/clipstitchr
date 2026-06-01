import { describe, expect, it } from "vitest";
import {
  scoreStitchrPair,
  selectStitchrPairs,
  type StitchrPairCandidate,
} from "./automationStitchrPairScoring";

const nowMs = Date.parse("2026-05-31T12:00:00.000Z");

function candidate(
  overrides: Partial<StitchrPairCandidate>,
): StitchrPairCandidate {
  return {
    ugcClipId: "ugc_1",
    demoClipId: "demo_1",
    pairUseCount: 0,
    wasUsedInPreviousRun: false,
    ...overrides,
  };
}

describe("automation Stitchr pair scoring", () => {
  it("prefers unused pairs over recently repeated pairs", () => {
    const unusedScore = scoreStitchrPair(candidate({}), nowMs);
    const repeatedScore = scoreStitchrPair(
      candidate({
        pairLastUsedAt: "2026-05-30T12:00:00.000Z",
        pairUseCount: 4,
        wasUsedInPreviousRun: true,
      }),
      nowMs,
    );

    expect(unusedScore).toBeGreaterThan(repeatedScore);
  });

  it("selects unique highest weighted pairs deterministically for a seed", () => {
    const pairs = selectStitchrPairs(
      [
        candidate({ ugcClipId: "ugc_1", demoClipId: "demo_1" }),
        candidate({ ugcClipId: "ugc_2", demoClipId: "demo_1" }),
        candidate({
          ugcClipId: "ugc_3",
          demoClipId: "demo_1",
          pairUseCount: 10,
          pairLastUsedAt: "2026-05-30T12:00:00.000Z",
        }),
      ],
      2,
      "owner_1:2026-05-31:stitchr",
      nowMs,
    );

    expect(pairs).toHaveLength(2);
    expect(pairs.map((pair) => pair.candidate.ugcClipId)).not.toContain(
      "ugc_3",
    );
    expect(selectStitchrPairs(
      [
        candidate({ ugcClipId: "ugc_1", demoClipId: "demo_1" }),
        candidate({ ugcClipId: "ugc_2", demoClipId: "demo_1" }),
        candidate({
          ugcClipId: "ugc_3",
          demoClipId: "demo_1",
          pairUseCount: 10,
          pairLastUsedAt: "2026-05-30T12:00:00.000Z",
        }),
      ],
      2,
      "owner_1:2026-05-31:stitchr",
      nowMs,
    )).toEqual(pairs);
  });
});
