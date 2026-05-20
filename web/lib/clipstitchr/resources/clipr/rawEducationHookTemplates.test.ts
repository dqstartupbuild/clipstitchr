import { describe, expect, it } from "vitest";
import { rawEducationHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawEducationHookTemplates";

describe("rawEducationHookTemplates", () => {
  it("keeps education template IDs unique", () => {
    const templateIds = rawEducationHookTemplates.map(
      (template) => template.templateId,
    );

    expect(rawEducationHookTemplates).toHaveLength(24);
    expect(new Set(templateIds).size).toBe(templateIds.length);
    expect(templateIds).toContain("EDU-001");
    expect(templateIds).toContain("EDU-024");
  });

  it("allows education templates across Clipr, Swipr, and Stitchr", () => {
    expect(
      rawEducationHookTemplates.every((template) => {
        const purposes = template.allowedPurposes ?? [];

        return (
          template.source === "education_viral_patterns" &&
          purposes.includes("clipr") &&
          purposes.includes("swipr") &&
          purposes.includes("stitchr")
        );
      }),
    ).toBe(true);
  });
});
