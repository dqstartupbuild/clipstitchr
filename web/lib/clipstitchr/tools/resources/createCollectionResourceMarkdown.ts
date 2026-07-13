import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";

export function createCollectionResourceMarkdown(
  title: string,
  definition: CollectionResourceDefinition,
) {
  return [
    `# ${title}`,
    "",
    ...definition.items.flatMap((item) => [
      `## ${item.title}`,
      "",
      item.body,
      "",
      item.copyText,
      "",
      `Tags: ${item.tags.join(", ")}`,
      "",
    ]),
  ]
    .join("\n")
    .trim();
}
