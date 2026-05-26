export type CliprJobStatus =
  | "queued"
  | "scripting"
  | "generating-avatar-image"
  | "generating-avatar-video"
  | "ready-to-save"
  | "saving"
  | "completed"
  | "failed"
  | "canceled";
