import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";

type PostBridgePageItem = {
  id: string;
};

type PostBridgePageResponse<Item extends PostBridgePageItem> = {
  data: Item[];
  meta?: {
    total?: unknown;
  };
};

type ListAllPostBridgePagesOptions = {
  apiKey: string;
  path: string;
  query?: URLSearchParams;
  pageSize?: number;
};

export async function listAllPostBridgePages<Item extends PostBridgePageItem>({
  apiKey,
  path,
  query: baseQuery = new URLSearchParams(),
  pageSize = 100,
}: ListAllPostBridgePagesOptions) {
  const items: Item[] = [];
  const seenIds = new Set<string>();
  let offset = 0;

  while (true) {
    const query = new URLSearchParams(baseQuery);
    query.set("limit", String(pageSize));
    query.set("offset", String(offset));

    const response = await requestPostBridge<PostBridgePageResponse<Item>>(
      path,
      { apiKey, query },
    );
    let newItemCount = 0;

    response.data.forEach((item) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        items.push(item);
        newItemCount += 1;
      }
    });

    offset += response.data.length;

    const total =
      typeof response.meta?.total === "number" &&
      Number.isFinite(response.meta.total)
        ? response.meta.total
        : null;

    if (
      response.data.length === 0 ||
      newItemCount === 0 ||
      (total !== null && offset >= total) ||
      (total === null && response.data.length < pageSize)
    ) {
      return items;
    }
  }
}
