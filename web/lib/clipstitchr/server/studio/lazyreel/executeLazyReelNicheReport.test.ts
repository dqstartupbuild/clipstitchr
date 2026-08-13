import { describe, expect, it } from "vitest";
import { executeLazyReelNicheReport } from "./executeLazyReelNicheReport";

describe("executeLazyReelNicheReport", () => {
  it("returns the real overview slice with explicit evidence labels", () => {
    const result = executeLazyReelNicheReport({ tool: "niche_report", niche: "skincare" });

    expect(result.data.focus).toBe("overview");
    expect(result.data.sampleSize).toBe(496);
    expect(result.data.hookLift[0]).toMatchObject({ label: "speed-of-claim", lift: 8.95 });
    expect(result.data.examples[0]?.viewsPerFollower).toBe(2297.3);
    expect(result.evidence.map((item) => item.kind)).toEqual([
      "derived",
      "observed",
      "heuristic",
    ]);
    expect(result.limitations.join(" ")).toContain("raw 5,560-video corpus");
  });

  it.each(["format", "trends", "combos", "apps"] as const)(
    "supports the %s focus",
    (focus) => {
      const result = executeLazyReelNicheReport({
        focus,
        limit: 3,
        niche: "skincare",
        tool: "niche_report",
      });

      expect(result.data.focus).toBe(focus);
      expect(JSON.parse(JSON.stringify(result))).toEqual(result);
      if (focus === "format") {
        expect(result.data.formatLift[0]).toMatchObject({ label: "text-overlay-heavy", lift: 3 });
      }
      if (focus === "trends") {
        expect(result.data.trends).toHaveLength(3);
      }
      if (focus === "combos") {
        expect(result.data.combinations[0]).toMatchObject({
          label: "speed-of-claim + woman",
          lift: 6,
        });
      }
      if (focus === "apps") {
        expect(result.data.apps[0]).toMatchObject({ appName: "Notion", count: 3 });
        expect(result.data.apps.some((item) => item.appName === "unknown")).toBe(false);
        expect(result.data.topAppPatterns[0]?.lift).toBeGreaterThan(1);
      }
    },
  );

  it("uses an explicit cross-niche fallback for an unmatched non-empty niche", () => {
    const result = executeLazyReelNicheReport({
      niche: "quantum potato",
      tool: "niche_report",
    });

    expect(result.data.scope).toBe("cross-niche fallback");
    expect(result.limitations.join(" ")).toContain("No direct quantum potato slice");
  });
});
