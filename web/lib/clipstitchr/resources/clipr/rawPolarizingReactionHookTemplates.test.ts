import { describe, expect, it } from "vitest";
import { rawPolarizingReactionHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawPolarizingReactionHookTemplates";

describe("rawPolarizingReactionHookTemplates", () => {
  it("keeps the polarizing reaction pack complete and uniquely identified", () => {
    const templateIds = rawPolarizingReactionHookTemplates.map(
      (template) => template.templateId,
    );

    expect(rawPolarizingReactionHookTemplates).toHaveLength(50);
    expect(new Set(templateIds).size).toBe(templateIds.length);
    expect(templateIds[0]).toBe("PR-001");
    expect(templateIds.at(-1)).toBe("PR-050");
  });

  it("keeps polarizing reaction templates scoped to Stitchr", () => {
    expect(
      rawPolarizingReactionHookTemplates.every((template) => {
        const purposes = template.allowedPurposes ?? [];

        return (
          template.source === "polarizing_reaction_patterns" &&
          purposes.includes("stitchr") &&
          !purposes.includes("clipr") &&
          !purposes.includes("swipr")
        );
      }),
    ).toBe(true);
  });
});
