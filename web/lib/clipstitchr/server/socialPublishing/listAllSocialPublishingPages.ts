import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

type SocialPublishingPageItem = {
  _id?: string;
  id?: string;
  postId?: string;
};

type SocialPublishingPageResponse<Item extends SocialPublishingPageItem> = {
  data?: Item[];
  posts?: Item[];
  pagination?: {
    pages?: unknown;
  };
};

type ListAllSocialPublishingPagesOptions = {
  apiKey: string;
  path: string;
  query?: URLSearchParams;
  pageSize?: number;
};

export async function listAllSocialPublishingPages<Item extends SocialPublishingPageItem>({
  apiKey,
  path,
  query: baseQuery = new URLSearchParams(),
  pageSize = 100,
}: ListAllSocialPublishingPagesOptions) {
  const items: Item[] = [];
  const seenIds = new Set<string>();
  let page = 1;

  while (true) {
    const query = new URLSearchParams(baseQuery);
    query.set("limit", String(pageSize));
    query.set("page", String(page));

    const response = await requestSocialPublishing<SocialPublishingPageResponse<Item>>(
      path,
      { apiKey, query },
    );
    const pageItems = response.posts ?? response.data ?? [];

    pageItems.forEach((item) => {
      const id = item._id ?? item.id ?? item.postId;

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        items.push(item);
      }
    });

    const pages =
      typeof response.pagination?.pages === "number"
        ? response.pagination.pages
        : null;

    if (pageItems.length === 0 || (pages !== null ? page >= pages : pageItems.length < pageSize)) {
      return items;
    }

    page += 1;
  }
}
