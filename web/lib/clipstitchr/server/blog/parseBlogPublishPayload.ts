import {
  blogPublishPayloadSchema,
  type BlogPublishArticle,
} from "./blogPublishPayloadSchema";

export function parseBlogPublishPayload(input: unknown): BlogPublishArticle[] {
  const result = blogPublishPayloadSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Invalid blog publish payload.");
  }

  const payload = result.data;

  if (payload.event_type === "update_article") {
    return [payload.data.article];
  }

  return payload.data.articles;
}
