export type CliprJobStatus =
  | "queued"
  | "scripting"
  | "generating-avatar-image"
  | "generating-avatar-video"
  | "generating-video"
  | "composing-media"
  | "ready-to-save"
  | "saving"
  | "completed"
  | "failed"
  | "canceled";
