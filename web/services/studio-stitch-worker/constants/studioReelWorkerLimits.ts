export const STUDIO_REEL_WORKER_LIMITS = {
  checkpointBytes: 128 * 1024,
  commandOutputBytes: 1024 * 1024,
  coordinatorResponseBytes: 512 * 1024,
  inputBytes: 2 * 1024 * 1024 * 1024,
  providerResponseBytes: 32 * 1024 * 1024,
  reactionBytes: 512 * 1024 * 1024,
  renderedOutputBytes: 512 * 1024 * 1024,
  workspaceBytes: 4 * 1024 * 1024 * 1024,
} as const;
