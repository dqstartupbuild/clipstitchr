import type { StudioClipsOutputEditState } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutputEditState";

export function parseStudioClipsOutputEditState(
  snapshotVersion: number,
  snapshotJson: string,
): StudioClipsOutputEditState {
  if (snapshotVersion !== 1) {
    throw new Error("Stored Studio Clips edit metadata uses an unsupported version.");
  }
  const value = JSON.parse(snapshotJson) as StudioClipsOutputEditState;
  if (
    value.version !== 1 ||
    !value.acceptance ||
    !Array.isArray(value.handoffs) ||
    !value.regenerate
  ) {
    throw new Error("Stored Studio Clips edit metadata is invalid.");
  }
  return value;
}
