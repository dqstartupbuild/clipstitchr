import type { StudioEditorTrackV1 } from "../../types/studioEditor/StudioEditorTrackV1";

export function assertStudioEditorTrackEditable(track: StudioEditorTrackV1) {
  if (track.locked) {
    throw new Error(`Studio editor track is locked: ${track.id}`);
  }
}
