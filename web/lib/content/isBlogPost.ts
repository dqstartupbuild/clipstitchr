import type { Blog, CaseStudy } from "content-collections";

export function isBlogPost(post: Blog | CaseStudy): post is Blog {
  return "featured" in post;
}
