import { describe, expect, it } from "vitest";
import { appUgcAdBriefTemplateDefinition } from "@/lib/clipstitchr/tools/appUgcAdBriefTemplate/appUgcAdBriefTemplateDefinition";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";

describe("appUgcAdBriefTemplateDefinition", () => {
  it("contains a substantial blank brief and a complete example", () => {
    const sections: readonly GuidedResourceSection[] =
      appUgcAdBriefTemplateDefinition.sections;
    const items = sections.flatMap((section) => section.items);
    const ids = items.map((item) => item.id);

    expect(items).toHaveLength(19);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      appUgcAdBriefTemplateDefinition.sections.find(
        (section) => section.id === "brief-example",
      )?.items,
    ).toHaveLength(8);
    expect(items.filter((item) => item.noteLabel)).toHaveLength(11);
  });

  it("copies visitor notes and the fictional example into Markdown", () => {
    const markdown = createGuidedResourceMarkdown(
      appUgcAdBriefTemplateDefinition,
      new Set(["brief-audience-outcome"]),
      {
        "brief-audience-outcome":
          "Founders who lose follow-up tasks after customer calls.",
      },
    );

    expect(markdown).toContain(
      "Founders who lose follow-up tasks after customer calls.",
    );
    expect(markdown).toContain("Fictional app: TempoList");
    expect(markdown).toContain("Usage-information questions");
    expect(markdown).toContain("Review and reshoot expectations");
  });
});
