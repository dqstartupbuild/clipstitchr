import { describe, expect, it } from "vitest";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";
import { shortFormAdPreflightDefinition } from "@/lib/clipstitchr/tools/shortFormAdPreflight/shortFormAdPreflightDefinition";

describe("shortFormAdPreflightDefinition", () => {
  it("provides exactly twenty checks across the promised review areas", () => {
    const sections: readonly GuidedResourceSection[] =
      shortFormAdPreflightDefinition.sections;
    const items = sections.flatMap((section) => section.items);
    const copy = items.map((item) => `${item.title} ${item.body}`).join(" ");

    expect(items).toHaveLength(20);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(items.filter((item) => item.critical).length).toBeGreaterThanOrEqual(
      10,
    );
    expect(copy).toMatch(/Hook/);
    expect(copy).toMatch(/Demo/);
    expect(copy).toMatch(/Proof/);
    expect(copy).toMatch(/Claim/);
    expect(copy).toMatch(/CTA/);
    expect(copy).toMatch(/Captions/);
    expect(copy).toMatch(/Audio/);
    expect(copy).toMatch(/framing/i);
    expect(copy).toMatch(/Usage/);
    expect(copy).toMatch(/Destination/);
  });

  it("exports safety blockers without declaring approval", () => {
    const markdown = createGuidedResourceMarkdown(
      shortFormAdPreflightDefinition,
      new Set(["preflight-hook"]),
      {},
    );

    expect(markdown).toContain("Usage information is confirmed");
    expect(markdown).toContain("Private information is absent");
    expect(markdown).not.toContain("Ad approved");
    expect(markdown).not.toContain("Guaranteed approval");
  });
});
