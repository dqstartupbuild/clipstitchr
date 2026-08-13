export const STUDIO_CLIPS_TASK_STATUSES = [
  "queued",
  "processing",
  "completed",
  "error",
  "cancelled",
] as const;

export type StudioClipsTaskStatus =
  (typeof STUDIO_CLIPS_TASK_STATUSES)[number];
