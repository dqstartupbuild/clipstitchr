import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getClipIsClipr } from "@/lib/clipstitchr/utils/getClipIsClipr";

export function filterNonGeneratedClips(clips: VideoClipMetadata[]) {
  return clips.filter(
    (clip) => clip.swaprMetadata?.source !== "swapr" && !getClipIsClipr(clip),
  );
}
