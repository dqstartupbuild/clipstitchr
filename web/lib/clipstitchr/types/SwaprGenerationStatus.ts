export type SwaprGenerationStatus =
  | "idle"
  | "splitting"
  | "uploading"
  | "queued"
  | "processing"
  | "downloading"
  | "normalizing"
  | "stitching"
  | "saving"
  | "succeeded"
  | "failed";
