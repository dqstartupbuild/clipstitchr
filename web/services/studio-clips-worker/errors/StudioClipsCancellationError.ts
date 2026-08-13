import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";

export class StudioClipsCancellationError extends Error {
  readonly checkpoint: StudioClipsCheckpoint;

  constructor(checkpoint: StudioClipsCheckpoint) {
    super("Studio Clips processing was cancelled.");
    this.name = "StudioClipsCancellationError";
    this.checkpoint = checkpoint;
  }
}
