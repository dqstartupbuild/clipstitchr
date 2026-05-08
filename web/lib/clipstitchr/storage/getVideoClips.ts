import { indexedDbLibraryReadPageSize } from "@/lib/clipstitchr/constants/indexedDbLibraryReadPageSize";
import { getVideoClipMetadataPage } from "@/lib/clipstitchr/storage/getVideoClipMetadataPage";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export async function getVideoClips() {
  const clips: VideoClipMetadata[] = [];
  let offset = 0;

  while (true) {
    const page = await getVideoClipMetadataPage({
      offset,
      limit: indexedDbLibraryReadPageSize,
    });

    clips.push(...page);

    if (page.length < indexedDbLibraryReadPageSize) {
      return clips;
    }

    offset += page.length;
  }
}
