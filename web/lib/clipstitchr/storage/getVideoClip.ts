import { createHydratedVideoClip } from "@/lib/clipstitchr/storage/createHydratedVideoClip";
import { getVideoClipBlob } from "@/lib/clipstitchr/storage/getVideoClipBlob";
import { getVideoClipMetadata } from "@/lib/clipstitchr/storage/getVideoClipMetadata";

export async function getVideoClip(id: string) {
  const [metadata, blobRecord] = await Promise.all([
    getVideoClipMetadata(id),
    getVideoClipBlob(id),
  ]);

  if (!metadata || !blobRecord) {
    return undefined;
  }

  return createHydratedVideoClip(metadata, blobRecord);
}
