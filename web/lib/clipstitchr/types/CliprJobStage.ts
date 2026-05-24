export type CliprJobStage =
  | "queued"
  | "hook-script"
  | "avatar-image"
  | "avatar-video"
  | "generated-video"
  | "media-compose"
  | "browser-save"
  | "finalized"
  | "failed"
  | "canceled";
