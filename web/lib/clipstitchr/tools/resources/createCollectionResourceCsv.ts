import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";
import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";

export function createCollectionResourceCsv(
  definition: CollectionResourceDefinition,
) {
  return createCsvText([
    ["id", "title", "category", "label", "body", "copy_text", "tags"],
    ...definition.items.map((item) => [
      item.id,
      item.title,
      item.category,
      item.eyebrow,
      item.body,
      item.copyText,
      item.tags.join(" | "),
    ]),
  ]);
}
