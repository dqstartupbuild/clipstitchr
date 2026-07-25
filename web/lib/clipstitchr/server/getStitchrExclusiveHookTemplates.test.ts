import { describe, expect, it } from "vitest";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import { getStitchrExclusiveHookTemplates } from "@/lib/clipstitchr/server/getStitchrExclusiveHookTemplates";

describe("getStitchrExclusiveHookTemplates", () => {
  it("returns the 300 discovery patterns and existing reaction pack for Stitchr", () => {
    const templates = getStitchrExclusiveHookTemplates({
      purpose: "stitchr",
      templates: cliprHookTemplates,
    });

    expect(
      templates.filter(
        (template) => template.source === "ugc_discovery_patterns",
      ),
    ).toHaveLength(300);
    expect(
      templates.some(
        (template) => template.source === "polarizing_reaction_patterns",
      ),
    ).toBe(true);
  });

  it("does not expose Stitchr-exclusive patterns to other tools", () => {
    expect(
      getStitchrExclusiveHookTemplates({
        purpose: "clipr",
        templates: cliprHookTemplates,
      }),
    ).toEqual([]);
    expect(
      getStitchrExclusiveHookTemplates({
        purpose: "swipr",
        templates: cliprHookTemplates,
      }),
    ).toEqual([]);
  });
});
