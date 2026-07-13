import { describe, expect, it } from "vitest";
import { appRawFootageIntakeDefinition } from "@/lib/clipstitchr/tools/appRawFootageIntake/appRawFootageIntakeDefinition";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";

describe("appRawFootageIntakeDefinition", () => {
  it("covers selectable deliverables and the complete intake handoff", () => {
    const sections: readonly GuidedResourceSection[] =
      appRawFootageIntakeDefinition.sections;
    const items = sections.flatMap((section) => section.items);
    const copy = items.map((item) => `${item.title} ${item.body}`).join(" ");

    expect(items).toHaveLength(27);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(copy).toContain("Opening takes");
    expect(copy).toContain("App demo recording");
    expect(copy).toContain("Original full-resolution files");
    expect(copy).toContain("Consent evidence and owner");
    expect(copy).toContain("Delivery service and deadline");
    expect(copy).toContain("File manifest");
  });

  it("exports selected roles and visitor intake notes", () => {
    const markdown = createGuidedResourceMarkdown(
      appRawFootageIntakeDefinition,
      new Set(["intake-openings", "intake-demo"]),
      {
        "intake-openings": "Three problem-first openings.",
        "intake-deadline": "Upload by Friday at noon.",
      },
    );

    expect(markdown).toContain("[x] **Opening takes**");
    expect(markdown).toContain("Three problem-first openings.");
    expect(markdown).toContain("Upload by Friday at noon.");
    expect(markdown).toContain("do not create or verify rights");
  });
});
