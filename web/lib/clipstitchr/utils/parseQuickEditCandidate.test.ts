import { describe, expect, it } from "vitest";
import { parseQuickEditCandidate } from "@/lib/clipstitchr/utils/parseQuickEditCandidate";

describe("parseQuickEditCandidate", () => {
  it("keeps valid detector-backed candidate fields", () => {
    expect(
      parseQuickEditCandidate({
        start: "3.2",
        end: 6.8,
        confidence: 1.2,
        signals: ["loading-text", "low-motion", "unknown"],
        reason: " Loading screen ",
        stats: " 91% static frames ",
      }),
    ).toEqual({
      start: 3.2,
      end: 6.8,
      confidence: 1,
      signals: ["loading-text", "low-motion"],
      reason: "Loading screen",
      stats: "91% static frames",
    });
  });

  it("drops candidates without usable timestamps, confidence, or signals", () => {
    expect(
      parseQuickEditCandidate({
        start: 5,
        end: 4,
        confidence: 0.8,
        signals: ["silence"],
      }),
    ).toBeNull();
    expect(
      parseQuickEditCandidate({
        start: 1,
        end: 4,
        confidence: "high",
        signals: ["silence"],
      }),
    ).toBeNull();
    expect(
      parseQuickEditCandidate({
        start: 1,
        end: 4,
        confidence: 0.8,
        signals: ["unknown"],
      }),
    ).toBeNull();
  });
});
