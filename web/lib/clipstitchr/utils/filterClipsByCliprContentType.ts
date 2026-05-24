import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getCliprContentType } from "@/lib/clipstitchr/utils/getCliprContentType";

export function filterClipsByCliprContentType(
  clips: VideoClipMetadata[],
  contentType: CliprContentType | "all",
) {
  if (contentType === "all") {
    return clips;
  }

  return clips.filter(
    (clip) =>
      getCliprContentType(clip.cliprMetadata?.contentType) === contentType,
  );
}
