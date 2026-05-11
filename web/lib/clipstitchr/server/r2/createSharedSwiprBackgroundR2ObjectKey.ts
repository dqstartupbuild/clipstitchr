import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";

type CreateSharedSwiprBackgroundR2ObjectKeyOptions = {
  recordId: string;
  contentType: string;
};

export function createSharedSwiprBackgroundR2ObjectKey({
  recordId,
  contentType,
}: CreateSharedSwiprBackgroundR2ObjectKeyOptions) {
  const extension = getMimeTypeFileExtension(contentType, "jpg");

  return [
    "shared",
    "swipr-backgrounds",
    sanitizeR2KeySegment(recordId),
    `image.${extension}`,
  ].join("/");
}
