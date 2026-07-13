import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

export function createNineBySixteenCompatibilityNotes(
  inspection: LocalVideoInspection,
) {
  const notes: string[] = [];

  if (inspection.rotation !== 0) {
    notes.push(
      `The display size already includes ${inspection.rotation}° rotation metadata. Baking that rotation into a re-export can make playback more predictable.`,
    );
  }

  if (inspection.videoTrackCount > 1) {
    notes.push(
      `This file has ${inspection.videoTrackCount} video tracks. Most ad workflows use one primary video track.`,
    );
  }

  if (inspection.audioTrackCount > 1) {
    notes.push(
      `This file has ${inspection.audioTrackCount} audio tracks. Confirm the intended track stays selected after export.`,
    );
  }

  return notes;
}
