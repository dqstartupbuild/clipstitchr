import { describe, expect, it } from "vitest";
import { rawUgcDiscoveryHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawUgcDiscoveryHookTemplates";

describe("rawUgcDiscoveryHookTemplates", () => {
  it("provides 300 distinct creator-discovery patterns", () => {
    const templateIds = rawUgcDiscoveryHookTemplates.map(
      (template) => template.templateId,
    );
    const templateTexts = rawUgcDiscoveryHookTemplates.map(
      (template) => template.template,
    );

    expect(rawUgcDiscoveryHookTemplates).toHaveLength(300);
    expect(new Set(templateIds).size).toBe(300);
    expect(new Set(templateTexts).size).toBe(300);
    expect(templateIds[0]).toBe("UGD-001");
    expect(templateIds.at(-1)).toBe("UGD-300");
  });

  it("keeps every discovery pattern exclusive to Stitchr", () => {
    expect(
      rawUgcDiscoveryHookTemplates.every(
        (template) =>
          template.source === "ugc_discovery_patterns" &&
          template.allowedPurposes?.length === 1 &&
          template.allowedPurposes[0] === "stitchr",
      ),
    ).toBe(true);
  });

  it("covers multiple creator-discovery styles without brand names", () => {
    const styleKeys = new Set(
      rawUgcDiscoveryHookTemplates.map((template) => template.styleKey),
    );

    expect(styleKeys.size).toBeGreaterThanOrEqual(8);
    expect(
      rawUgcDiscoveryHookTemplates.every(
        (template) =>
          !/\b(download|sign up|subscribe|buy now|our app)\b/i.test(
            template.template,
          ),
      ),
    ).toBe(true);
  });
});
