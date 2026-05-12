export type CliprJobStage =
  | "queued"
  | "hook-script"
  | "scene-generation"
  | "browser-stitching"
  | "finalized"
  | "failed"
  | "canceled";
