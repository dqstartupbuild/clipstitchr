import { describe, expect, it } from "vitest";
import { appDemoVideoHooks } from "@/lib/clipstitchr/tools/appDemoVideoHooks/appDemoVideoHooks";

describe("appDemoVideoHooks", () => {
  it("contains 100 individually identifiable, copyable hooks", () => {
    expect(appDemoVideoHooks).toHaveLength(100);
    expect(new Set(appDemoVideoHooks.map((item) => item.id)).size).toBe(100);
    expect(new Set(appDemoVideoHooks.map((item) => item.title)).size).toBe(100);
    expect(new Set(appDemoVideoHooks.map((item) => item.copyText)).size).toBe(
      100,
    );
  });

  it("provides ten useful angles with ten hooks apiece", () => {
    const categoryCounts = Object.groupBy(
      appDemoVideoHooks,
      (item) => item.category,
    );

    expect(Object.keys(categoryCounts)).toHaveLength(10);
    expect(Object.values(categoryCounts).map((items) => items?.length)).toEqual(
      Array.from({ length: 10 }, () => 10),
    );
  });

  it("pairs every hook with a visual handoff and claim check", () => {
    for (const item of appDemoVideoHooks) {
      expect(item.body).toContain("Opening visual:");
      expect(item.body).toContain("Claim check:");
      expect(item.copyText).not.toMatch(/guaranteed winner|proven to convert/i);
    }
  });
});
