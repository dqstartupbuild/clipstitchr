type AccountWideUgcClipInput = {
  clipType: "demo" | "ugc";
  cliprMetadata?: unknown;
  swaprMetadata?: unknown;
};

export function getVideoClipIsAccountWideUgc(clip: AccountWideUgcClipInput) {
  return (
    clip.clipType === "ugc" &&
    !clip.cliprMetadata &&
    !clip.swaprMetadata
  );
}
