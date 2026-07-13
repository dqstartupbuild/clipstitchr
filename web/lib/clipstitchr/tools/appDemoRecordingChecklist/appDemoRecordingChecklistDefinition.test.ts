import { describe, expect, it } from "vitest";
import { appDemoRecordingChecklistDefinition } from "@/lib/clipstitchr/tools/appDemoRecordingChecklist/appDemoRecordingChecklistDefinition";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";

describe("appDemoRecordingChecklistDefinition", () => {
  it("provides exactly eighteen unique capture-method-aware checks", () => {
    const sections: readonly GuidedResourceSection[] =
      appDemoRecordingChecklistDefinition.sections;
    const items = sections.flatMap((section) => section.items);
    const ids = items.map((item) => item.id);
    const copy = items.map((item) => item.body).join(" ");

    expect(items).toHaveLength(18);
    expect(new Set(ids).size).toBe(ids.length);
    expect(copy).toContain("Phone:");
    expect(copy).toContain("Desktop or emulator:");
    expect(items.filter((item) => item.critical).length).toBeGreaterThanOrEqual(
      8,
    );
  });

  it("exports blocker notes and the final handoff checks", () => {
    const markdown = createGuidedResourceMarkdown(
      appDemoRecordingChecklistDefinition,
      new Set(["demo-safe-data", "demo-clean-original"]),
      { "demo-safe-data": "Use the sample workspace and fake names." },
    );

    expect(markdown).toContain("Use the sample workspace and fake names.");
    expect(markdown).toContain("Keep one clean original");
    expect(markdown).toContain("Label the demo for handoff");
  });
});
