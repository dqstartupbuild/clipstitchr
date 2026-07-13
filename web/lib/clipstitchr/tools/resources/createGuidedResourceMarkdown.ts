import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";
import type { GuidedResourceNotes } from "@/lib/clipstitchr/tools/resources/GuidedResourceNotes";

export function createGuidedResourceMarkdown(
  definition: GuidedResourceDefinition,
  completedIds: ReadonlySet<string>,
  notes: GuidedResourceNotes,
) {
  const sections = definition.sections.flatMap((section) => [
    `## ${section.title}`,
    "",
    section.description,
    "",
    ...section.items.flatMap((item) => {
      const note = notes[item.id]?.trim();

      return [
        `- [${completedIds.has(item.id) ? "x" : " "}] **${item.title}** — ${item.body}`,
        ...(note ? [`  - My note: ${note}`] : []),
      ];
    }),
    "",
  ]);

  return [`# ${definition.completionLabel}`, "", ...sections].join("\n").trim();
}
