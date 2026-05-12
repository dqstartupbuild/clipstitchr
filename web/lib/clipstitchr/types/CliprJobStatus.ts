export type CliprJobStatus =
  | "queued"
  | "scripting"
  | "generating-scenes"
  | "ready-to-stitch"
  | "stitching"
  | "completed"
  | "failed"
  | "canceled";
