import { createBlogImageObjectKey } from "./createBlogImageObjectKey";
import { fetchBlogImageSource } from "./fetchBlogImageSource";

type CopyBlogImageSourceBytesOptions = {
  slug: string;
  sourceUrl: string;
};

export async function copyBlogImageSourceBytes({
  slug,
  sourceUrl,
}: CopyBlogImageSourceBytesOptions) {
  const image = await fetchBlogImageSource(sourceUrl);

  return {
    ...image,
    key: createBlogImageObjectKey({
      slug,
      sourceUrl,
      contentType: image.contentType,
    }),
  };
}
