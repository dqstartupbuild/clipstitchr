import { describe, expect, it } from "vitest";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";
import { ugcCreatorHandoffKitDefinition } from "@/lib/clipstitchr/tools/ugcCreatorHandoffKit/ugcCreatorHandoffKitDefinition";

describe("ugcCreatorHandoffKitDefinition", () => {
  it("contains every promised handoff artifact with unique items", () => {
    const sections: readonly GuidedResourceSection[] =
      ugcCreatorHandoffKitDefinition.sections;
    const items = sections.flatMap((section) => section.items);
    const sectionTitles = ugcCreatorHandoffKitDefinition.sections.map(
      (section) => section.title,
    );

    expect(items).toHaveLength(25);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(sectionTitles.join(" ")).toContain("Delivery checklist");
    expect(sectionTitles.join(" ")).toContain("Folder layout");
    expect(sectionTitles.join(" ")).toContain("Upload manifest");
    expect(sectionTitles.join(" ")).toContain("Usage-information request");
    expect(sectionTitles.join(" ")).toContain("Missing-file note");
    expect(sectionTitles.join(" ")).toContain("Reshoot request template");
  });

  it("exports the naming and replacement templates", () => {
    const markdown = createGuidedResourceMarkdown(
      ugcCreatorHandoffKitDefinition,
      new Set(["handoff-name-example"]),
      { "handoff-reshoot-detail": "Replace take 2 with a clean ending." },
    );

    expect(markdown).toContain(
      "tempolist_maya_opening_forgetful_take02_v1.mov",
    );
    expect(markdown).toContain("Replace take 2 with a clean ending.");
    expect(markdown).toContain("do not grant or verify rights");
  });
});
