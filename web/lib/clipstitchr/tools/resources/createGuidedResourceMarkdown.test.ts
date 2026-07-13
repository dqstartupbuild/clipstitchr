import { describe, expect, it } from "vitest";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";
import { createGuidedResourceMarkdown } from "@/lib/clipstitchr/tools/resources/createGuidedResourceMarkdown";

const definition = {
  completionLabel: "My plan",
  estimatedMinutes: 5,
  faqs: [],
  guideParagraphs: [],
  guideTitle: "Guide",
  resourceKey: "app-ad-shot-list-generator",
  sections: [
    {
      description: "Prepare the source.",
      id: "prepare",
      items: [
        {
          body: "Record one clean take.",
          id: "clean-take",
          noteLabel: "My note",
          title: "Clean take",
        },
      ],
      title: "Prepare",
    },
  ],
} satisfies GuidedResourceDefinition;

describe("createGuidedResourceMarkdown", () => {
  it("includes progress and visitor notes", () => {
    expect(
      createGuidedResourceMarkdown(definition, new Set(["clean-take"]), {
        "clean-take": "Film this before lunch.",
      }),
    ).toContain(
      "- [x] **Clean take** — Record one clean take.\n  - My note: Film this before lunch.",
    );
  });
});
