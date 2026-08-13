import type { StudioClipsOutputEditOperation } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutputEditOperation";
import type { StudioClipsOutputEditState } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutputEditState";

export function applyStudioClipsOutputEditOperation(
  current: StudioClipsOutputEditState,
  edit: StudioClipsOutputEditOperation,
  now: string,
): StudioClipsOutputEditState {
  if (edit.kind === "trim") {
    return {
      ...current,
      trim: { endSeconds: edit.endSeconds, startSeconds: edit.startSeconds },
    };
  }
  if (edit.kind === "split") {
    return { ...current, split: { pointsSeconds: edit.pointsSeconds } };
  }
  if (edit.kind === "merge") {
    return { ...current, merge: { outputIds: edit.outputIds } };
  }
  if (edit.kind === "captions") {
    return {
      ...current,
      captions: {
        burnIn: edit.burnIn,
        enabled: edit.enabled,
        ...(edit.languageCode ? { languageCode: edit.languageCode } : {}),
        ...(edit.style ? { style: edit.style } : {}),
        ...(edit.styleSnapshotJson
          ? { styleSnapshotJson: edit.styleSnapshotJson }
          : {}),
      },
    };
  }
  if (edit.kind === "project_style") {
    return {
      ...current,
      projectStyle: { snapshotJson: edit.snapshotJson, snapshotVersion: 1 },
    };
  }
  if (edit.kind === "regenerate") {
    return {
      ...current,
      regenerate: {
        ...(edit.instructions ? { instructions: edit.instructions } : {}),
        state: "requested",
        updatedAt: now,
      },
    };
  }
  if (edit.kind === "accept") {
    return {
      ...current,
      acceptance: {
        state: edit.accepted ? "accepted" : "rejected",
        updatedAt: now,
      },
    };
  }
  const handoffs = current.handoffs
    .filter((handoff) => handoff.destination !== edit.destination)
    .concat({
      destination: edit.destination,
      state: edit.state,
      updatedAt: now,
    })
    .sort((a, b) => a.destination.localeCompare(b.destination));
  return { ...current, handoffs };
}
