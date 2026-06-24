import { blogImageContentTypes } from "./blogImageContentTypes";
import { normalizeBlogImageContentType } from "./normalizeBlogImageContentType";

export function assertBlogImageContentType(contentTypeHeader: string | null) {
  const contentType = normalizeBlogImageContentType(contentTypeHeader ?? "");

  if (!blogImageContentTypes.has(contentType)) {
    throw new Error("Blog image URL did not return a supported image.");
  }

  return contentType;
}
