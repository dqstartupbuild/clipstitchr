import {
  STUDIO_CLIPS_CHECKPOINTS,
  type StudioClipsCheckpoint,
} from "../contracts/StudioClipsCheckpoint";

export function getStudioClipsStageShouldRun(
  currentCheckpoint: StudioClipsCheckpoint,
  targetCheckpoint: StudioClipsCheckpoint,
): boolean {
  return (
    STUDIO_CLIPS_CHECKPOINTS.indexOf(currentCheckpoint) <
    STUDIO_CLIPS_CHECKPOINTS.indexOf(targetCheckpoint)
  );
}
