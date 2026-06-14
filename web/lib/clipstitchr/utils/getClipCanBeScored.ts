import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getClipCanBeScored(
  clip: Pick<
    VideoClipMetadata,
    "clipType" | "cliprMetadata" | "libraryKind" | "swaprMetadata"
  >,
) {
  if (clip.libraryKind) {
    return clip.libraryKind === "demo" || clip.libraryKind === "ugc";
  }

  if (clip.clipType === "demo") {
    return true;
  }

  return (
    clip.clipType === "ugc" &&
    !clip.cliprMetadata &&
    clip.swaprMetadata?.source !== "swapr"
  );
}
