export type VideoClipLibraryKind = "clipr" | "demo" | "swapr" | "ugc";

type VideoClipLibraryKindInput = {
  clipType: "demo" | "ugc";
  cliprMetadata?: unknown;
  swaprMetadata?: {
    source?: string;
  };
};

export function getVideoClipLibraryKind(
  clip: VideoClipLibraryKindInput,
): VideoClipLibraryKind {
  if (clip.cliprMetadata) {
    return "clipr";
  }

  if (clip.swaprMetadata?.source === "swapr") {
    return "swapr";
  }

  if (clip.clipType === "demo") {
    return "demo";
  }

  return "ugc";
}
