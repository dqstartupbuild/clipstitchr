export type VideoClipLibraryKind = "clipr" | "demo" | "swapr" | "ugc";

type VideoClipLibraryKindInput = {
  clipType: "demo" | "ugc";
  swaprMetadata?: {
    source?: string;
  };
};

export function getVideoClipLibraryKind(
  clip: VideoClipLibraryKindInput,
): VideoClipLibraryKind {
  if (clip.clipType === "demo") {
    return "demo";
  }

  if (clip.swaprMetadata?.source === "swapr") {
    return "swapr";
  }

  return "ugc";
}
