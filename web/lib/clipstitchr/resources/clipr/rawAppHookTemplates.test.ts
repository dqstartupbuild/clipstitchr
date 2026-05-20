import { describe, expect, it } from "vitest";
import { rawAppHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawAppHookTemplates";

describe("rawAppHookTemplates", () => {
  it("keeps the app hook library complete and uniquely identified", () => {
    const templateIds = rawAppHookTemplates.map((template) => template.templateId);

    expect(rawAppHookTemplates).toHaveLength(820);
    expect(new Set(templateIds).size).toBe(templateIds.length);
    expect(templateIds[0]).toBe("APP-001");
    expect(templateIds.at(-1)).toBe("APP-820");
  });

  it("keeps app hooks available to Swipr and Stitchr only", () => {
    expect(
      rawAppHookTemplates.every((template) => {
        const purposes = template.allowedPurposes ?? [];

        return (
          template.source === "app_hook_library" &&
          purposes.includes("swipr") &&
          purposes.includes("stitchr") &&
          !purposes.includes("clipr")
        );
      }),
    ).toBe(true);
  });
});
