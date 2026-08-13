import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";
import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";

const publishingMediaDirectories: Record<
  Exclude<
    PublishingMediaSourceDescriptor["kind"],
    "studio-clip-output" | "studio-stitch-output"
  >,
  string
> = {
  "library-media": "video-clips",
  stitch: "stitches",
  swipe: "swipes",
};

export function getPublishingMediaObjectKeyPrefix(
  ownerId: string,
  descriptor: PublishingMediaSourceDescriptor,
) {
  if (descriptor.kind === "studio-clip-output") {
    return `${createUserR2KeyPrefix(ownerId)}studio/v1/studio-clips/`;
  }

  if (descriptor.kind === "studio-stitch-output") {
    return `${createUserR2KeyPrefix(ownerId)}studio/v1/media-output/`;
  }

  return `${createUserR2KeyPrefix(ownerId)}${publishingMediaDirectories[descriptor.kind]}/${sanitizeR2KeySegment(descriptor.recordId)}/`;
}
