import { describe, expect, it } from "vitest";
import { appAdHookStructures } from "@/lib/clipstitchr/tools/appAdHookStructures/appAdHookStructures";

describe("appAdHookStructures", () => {
  it("contains 50 distinct frameworks and examples", () => {
    expect(appAdHookStructures).toHaveLength(50);
    expect(new Set(appAdHookStructures.map((item) => item.id)).size).toBe(50);
    expect(new Set(appAdHookStructures.map((item) => item.title)).size).toBe(
      50,
    );
    expect(new Set(appAdHookStructures.map((item) => item.copyText)).size).toBe(
      50,
    );
  });

  it("provides five framework families with ten structures apiece", () => {
    const categoryCounts = Object.groupBy(
      appAdHookStructures,
      (item) => item.category,
    );

    expect(Object.keys(categoryCounts)).toHaveLength(5);
    expect(Object.values(categoryCounts).map((items) => items?.length)).toEqual(
      Array.from({ length: 5 }, () => 10),
    );
  });

  it("documents the full contract without making a performance claim", () => {
    for (const item of appAdHookStructures) {
      expect(item.body).toContain("Formula:");
      expect(item.body).toContain("Opening visual:");
      expect(item.body).toContain("Misuse warning:");
      expect(item.body).toContain("Claim guardrail:");
      expect(`${item.title} ${item.body} ${item.copyText}`).not.toMatch(
        /proven to convert|guaranteed performance/i,
      );
    }
  });
});
