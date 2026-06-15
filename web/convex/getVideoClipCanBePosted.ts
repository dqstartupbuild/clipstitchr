type VideoClipCanBePostedInput = {
  cliprMetadata?: {
    generationMode?: "broll" | "demo" | "reaction" | "script";
  };
};

export function getVideoClipCanBePosted(clip: VideoClipCanBePostedInput) {
  return (
    Boolean(clip.cliprMetadata) &&
    (!clip.cliprMetadata?.generationMode ||
      clip.cliprMetadata.generationMode === "script")
  );
}
