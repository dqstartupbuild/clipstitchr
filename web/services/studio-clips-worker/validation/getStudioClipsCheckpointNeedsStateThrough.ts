import {
  STUDIO_CLIPS_CHECKPOINTS,
  type StudioClipsCheckpoint,
} from "../contracts/StudioClipsCheckpoint";

export function getStudioClipsCheckpointNeedsStateThrough(input: {
  checkpoint: StudioClipsCheckpoint;
  finalCheckpoint: StudioClipsCheckpoint;
  requiredCheckpoint: StudioClipsCheckpoint;
}): boolean {
  const checkpointIndex = STUDIO_CLIPS_CHECKPOINTS.indexOf(input.checkpoint);
  return (
    checkpointIndex >=
      STUDIO_CLIPS_CHECKPOINTS.indexOf(input.requiredCheckpoint) &&
    checkpointIndex <= STUDIO_CLIPS_CHECKPOINTS.indexOf(input.finalCheckpoint)
  );
}
