type VideoClipNotificationInput = {
  clipType: "demo" | "ugc";
  cliprMetadata?: unknown;
  name: string;
  swaprMetadata?: {
    source?: string;
  };
};

export function getVideoClipNotificationCopy({
  clipType,
  cliprMetadata,
  name,
  swaprMetadata,
}: VideoClipNotificationInput) {
  if (swaprMetadata?.source === "swapr") {
    return {
      title: "Swap is ready",
      preview: `${name} is saved with your UGC clips.`,
      message: `Your Swap "${name}" is ready and saved with your UGC clips. You can use it in Swapr again or add it to a Stitchr batch.`,
    };
  }

  if (cliprMetadata) {
    return {
      title: "Clip is ready",
      preview: `${name} is saved in your library.`,
      message: `Your Clipr clip "${name}" is ready and saved in your Library.`,
    };
  }

  if (clipType === "demo") {
    return {
      title: "Demo upload is ready",
      preview: `${name} is ready to use in Stitchr.`,
      message: `Your demo video "${name}" finished uploading and is ready to use in Stitchr.`,
    };
  }

  return {
    title: "UGC upload is ready",
    preview: `${name} is ready to use.`,
    message: `Your UGC clip "${name}" finished uploading and is ready to use in Stitchr, Swapr, and Clipr.`,
  };
}
