import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";
import { blogImageStoragePrefix } from "./blogImageStoragePrefix";
import { createBlogImageSourceHash } from "./createBlogImageSourceHash";
import { getBlogImageBaseName } from "./getBlogImageBaseName";
import { getBlogImageExtension } from "./getBlogImageExtension";

type CreateBlogImageObjectKeyOptions = {
  slug: string;
  sourceUrl: string;
  contentType: string;
};

export function createBlogImageObjectKey({
  slug,
  sourceUrl,
  contentType,
}: CreateBlogImageObjectKeyOptions) {
  const slugSegment = sanitizeR2KeySegment(slug);
  const sourceHash = createBlogImageSourceHash(sourceUrl);
  const baseName = getBlogImageBaseName(sourceUrl);
  const extension = getBlogImageExtension(contentType);

  return [
    blogImageStoragePrefix,
    slugSegment,
    `${sourceHash}-${baseName}.${extension}`,
  ].join("/");
}
