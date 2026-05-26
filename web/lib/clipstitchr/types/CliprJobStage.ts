export type CliprJobStage =
  | "queued"
  | "hook-script"
  | "avatar-image"
  | "avatar-video"
  | "browser-save"
  | "finalized"
  | "failed"
  | "canceled";
