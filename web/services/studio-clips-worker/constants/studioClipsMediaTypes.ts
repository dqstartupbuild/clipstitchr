export const STUDIO_CLIPS_INPUT_CONTENT_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-matroska",
] as const;

export const STUDIO_CLIPS_BROLL_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  ...STUDIO_CLIPS_INPUT_CONTENT_TYPES,
] as const;
