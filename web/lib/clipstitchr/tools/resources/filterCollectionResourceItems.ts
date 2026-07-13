import type { CollectionResourceItem } from "@/lib/clipstitchr/tools/resources/CollectionResourceItem";

export function filterCollectionResourceItems(
  items: readonly CollectionResourceItem[],
  category: string,
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return items.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const searchable = [
      item.title,
      item.body,
      item.copyText,
      item.category,
      ...item.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      matchesCategory &&
      (!normalizedQuery || searchable.includes(normalizedQuery))
    );
  });
}
