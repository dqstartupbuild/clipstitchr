import type { Blog, CaseStudy } from "content-collections";

type SchemaTypeHint = "article" | "faq" | "comparison";

export function hasContentSchemaTypeHint(
  post: Blog | CaseStudy,
  schemaTypeHint: SchemaTypeHint,
) {
  return post.schemaTypeHints.includes(schemaTypeHint);
}
