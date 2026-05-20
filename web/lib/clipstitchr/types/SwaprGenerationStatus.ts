export type SwaprGenerationStatus =
  | "idle"
  | "uploading"
  | "queued"
  | "processing"
  | "downloading"
  | "normalizing"
  | "stitching"
  | "saving"
  | "succeeded"
  | "failed";
