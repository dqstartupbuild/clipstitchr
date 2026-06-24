import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { copyBlogImageSourceBytes } from "./copyBlogImageSourceBytes";
import { createBlogImagePublicUrl } from "./createBlogImagePublicUrl";

type CopyBlogImageSourceOptions = {
  slug: string;
  sourceUrl: string;
};

export async function copyBlogImageSource({
  slug,
  sourceUrl,
}: CopyBlogImageSourceOptions) {
  const copiedImage = await copyBlogImageSourceBytes({ slug, sourceUrl });

  await putR2Object({
    body: copiedImage.body,
    contentType: copiedImage.contentType,
    key: copiedImage.key,
  });

  return createBlogImagePublicUrl(copiedImage.key);
}
