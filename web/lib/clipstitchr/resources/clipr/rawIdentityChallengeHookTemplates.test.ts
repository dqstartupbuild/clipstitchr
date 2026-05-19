import { describe, expect, it } from "vitest";
import { rawIdentityChallengeHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawIdentityChallengeHookTemplates";

describe("rawIdentityChallengeHookTemplates", () => {
  it("keeps a 100-template expansion plus the original seed set", () => {
    expect(rawIdentityChallengeHookTemplates).toHaveLength(115);
  });

  it("keeps template IDs unique", () => {
    const templateIds = rawIdentityChallengeHookTemplates.map(
      (template) => template.templateId,
    );

    expect(new Set(templateIds).size).toBe(templateIds.length);
  });

  it("limits identity challenge templates to Swipr and Stitchr", () => {
    expect(
      rawIdentityChallengeHookTemplates.every(
        (template) => {
          const purposes = template.allowedPurposes ?? [];

          return (
            template.styleKey === "identity_challenge" &&
            purposes.includes("swipr") &&
            purposes.includes("stitchr") &&
            !purposes.includes("clipr")
          );
        },
      ),
    ).toBe(true);
  });
});
