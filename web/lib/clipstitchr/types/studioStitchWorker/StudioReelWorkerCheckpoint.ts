export type StudioReelWorkerCheckpoint =
  | "claim_validated"
  | "sources_acquired"
  | "gemini_ready"
  | "voice_ready"
  | "rendered"
  | "output_stored"
  | "completed";
