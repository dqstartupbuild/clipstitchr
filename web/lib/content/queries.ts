import { allBlogs, type Blog } from "content-collections";

function sortByDateDescending(posts: Blog[]) {
  return [...posts].sort((left, right) => {
    return (
      new Date(right.updated ?? right.date).getTime() -
      new Date(left.updated ?? left.date).getTime()
    );
  });
}

export function getAllBlogPosts() {
  return sortByDateDescending(allBlogs);
}

export function getPublishedBlogPosts() {
  return getAllBlogPosts().filter((post) => !post.draft);
}

export function getFeaturedBlogPosts() {
  return getPublishedBlogPosts().filter((post) => post.featured);
}

export function getRecentBlogPosts(limit = 3) {
  return getPublishedBlogPosts().slice(0, limit);
}

export function getBlogPostBySlug(slug: string) {
  return getPublishedBlogPosts().find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(post: Blog, limit = 3) {
  const published = getPublishedBlogPosts().filter(
    (candidate) => candidate.slug !== post.slug,
  );

  const explicit = post.relatedSlugs
    .map((slug) => published.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is Blog => Boolean(candidate));

  const inferred = published
    .filter((candidate) => !post.relatedSlugs.includes(candidate.slug))
    .map((candidate) => {
      let score = 0;

      if (candidate.category === post.category) {
        score += 3;
      }

      if (candidate.targetKeyword === post.targetKeyword) {
        score += 4;
      }

      score += candidate.tags.filter((tag) => post.tags.includes(tag)).length;

      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ candidate }) => candidate);

  const combined = [...explicit, ...inferred];
  const deduped = combined.filter(
    (candidate, index) =>
      combined.findIndex((entry) => entry.slug === candidate.slug) === index,
  );

  return deduped.slice(0, limit);
}

export function getBlogCategories() {
  return Array.from(
    new Set(getPublishedBlogPosts().map((post) => post.category)),
  ).sort();
}
