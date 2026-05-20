import { describe, expect, it } from "vitest";
import { rawCliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawCliprHookTemplates";

describe("rawCliprHookTemplates", () => {
  it("keeps the base Clipr hook library complete and uniquely identified", () => {
    const templateIds = rawCliprHookTemplates.map(
      (template) => template.templateId,
    );

    expect(rawCliprHookTemplates).toHaveLength(150);
    expect(new Set(templateIds).size).toBe(templateIds.length);
    expect(templateIds).toContain("MG-001");
    expect(templateIds).toContain("PB-010");
  });

  it("keeps each base style represented by ten templates", () => {
    const countsByStyle = new Map<string, number>();

    for (const template of rawCliprHookTemplates) {
      countsByStyle.set(
        template.styleKey,
        (countsByStyle.get(template.styleKey) ?? 0) + 1,
      );
    }

    expect(countsByStyle.size).toBe(15);
    expect([...countsByStyle.values()].every((count) => count === 10)).toBe(
      true,
    );
  });
});
