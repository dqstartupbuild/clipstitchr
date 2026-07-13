import { describe, expect, it } from "vitest";
import { ugcOpeningLinePrompts } from "@/lib/clipstitchr/tools/ugcOpeningLinePrompts/ugcOpeningLinePrompts";

describe("ugcOpeningLinePrompts", () => {
  it("contains 24 distinct recording prompts", () => {
    expect(ugcOpeningLinePrompts).toHaveLength(24);
    expect(new Set(ugcOpeningLinePrompts.map((item) => item.id)).size).toBe(24);
    expect(new Set(ugcOpeningLinePrompts.map((item) => item.title)).size).toBe(
      24,
    );
    expect(
      new Set(ugcOpeningLinePrompts.map((item) => item.copyText)).size,
    ).toBe(24);
  });

  it("provides four cards in each of six categories", () => {
    const categoryCounts = Object.groupBy(
      ugcOpeningLinePrompts,
      (item) => item.category,
    );

    expect(Object.keys(categoryCounts)).toEqual([
      "Problem",
      "Surprise",
      "Objection",
      "Demo",
      "Confession",
      "Outcome",
    ]);
    expect(Object.values(categoryCounts).map((items) => items?.length)).toEqual(
      Array.from({ length: 6 }, () => 4),
    );
  });

  it("gives a delivery note, alternate take, and proof guardrail on every card", () => {
    for (const item of ugcOpeningLinePrompts) {
      expect(item.body).toContain("Delivery:");
      expect(item.body).toContain("Alternate take:");
      expect(item.body).toContain("Proof guardrail:");
    }
  });
});
