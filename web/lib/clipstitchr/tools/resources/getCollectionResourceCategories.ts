import type { CollectionResourceItem } from "@/lib/clipstitchr/tools/resources/CollectionResourceItem";

export function getCollectionResourceCategories(
  items: readonly CollectionResourceItem[],
) {
  return Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
    a.localeCompare(b),
  );
}
