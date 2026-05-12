export type CliprGenerationStatus =
  | "idle"
  | "scripting"
  | "generating"
  | "downloading"
  | "normalizing"
  | "stitching"
  | "saving"
  | "succeeded"
  | "failed";
