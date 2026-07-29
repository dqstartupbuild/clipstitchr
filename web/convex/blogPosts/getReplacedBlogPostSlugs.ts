import type { Doc } from "../_generated/dataModel";

export function getReplacedBlogPostSlugs(
  nextSlug: string,
  canonicalPost: Doc<"blogPosts"> | null,
  duplicatePosts: Doc<"blogPosts">[],
) {
  const replacedSlugs = new Set(
    duplicatePosts.map((duplicatePost) => duplicatePost.slug),
  );

  if (canonicalPost && canonicalPost.slug !== nextSlug) {
    replacedSlugs.add(canonicalPost.slug);
  }

  replacedSlugs.delete(nextSlug);

  return Array.from(replacedSlugs);
}
