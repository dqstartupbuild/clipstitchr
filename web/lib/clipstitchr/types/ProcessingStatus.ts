export type ProcessingStatus =
  | "idle"
  | "reading"
  | "analyzing"
  | "normalizing"
  | "saving"
  | "stitching"
  | "queued"
  | "complete"
  | "error";
