import type { RssPost } from "./RssPost";

export function sortRssPostsByDateDescending(posts: RssPost[]) {
  return [...posts].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}
