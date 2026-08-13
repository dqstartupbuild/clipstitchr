import type { StudioClipsOutputEditOperation } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutputEditOperation";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { normalizeStudioClipsCaptionStyle } from "../studioClipsTasks/normalizeStudioClipsCaptionStyle";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { normalizeStudioClipsSafeJsonSnapshot } from "./normalizeStudioClipsSafeJsonSnapshot";

export function normalizeStudioClipsOutputEditOperation(
  edit: StudioClipsOutputEditOperation,
  ownerId: string,
  productId: string,
): StudioClipsOutputEditOperation {
  if (edit.kind === "trim") {
    if (
      !Number.isFinite(edit.startSeconds) ||
      !Number.isFinite(edit.endSeconds) ||
      edit.startSeconds < 0 ||
      edit.endSeconds <= edit.startSeconds ||
      edit.endSeconds > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputDurationSeconds
    ) {
      throw new Error("The trim range is invalid.");
    }
    return {
      endSeconds: edit.endSeconds,
      kind: "trim",
      startSeconds: edit.startSeconds,
    };
  }
  if (edit.kind === "split") {
    if (
      edit.pointsSeconds.length === 0 ||
      edit.pointsSeconds.length >
        STUDIO_CLIPS_PERSISTENCE_LIMITS.splitPointCount
    ) {
      throw new Error("Choose between 1 and 100 split points.");
    }
    const pointsSeconds = [...new Set(edit.pointsSeconds)].sort(
      (a, b) => a - b,
    );
    if (
      pointsSeconds.length !== edit.pointsSeconds.length ||
      pointsSeconds.some(
        (point) =>
          !Number.isFinite(point) ||
          point <= 0 ||
          point >= STUDIO_CLIPS_PERSISTENCE_LIMITS.inputDurationSeconds,
      )
    ) {
      throw new Error("Split points must be unique valid timestamps.");
    }
    return { kind: "split", pointsSeconds };
  }
  if (edit.kind === "merge") {
    if (
      edit.outputIds.length < 2 ||
      edit.outputIds.length > STUDIO_CLIPS_PERSISTENCE_LIMITS.mergeOutputCount
    ) {
      throw new Error("Choose between 2 and 20 outputs to merge.");
    }
    const outputIds = edit.outputIds.map((id) =>
      assertStudioClipsIdentifier(id, "Studio Clips output ID"),
    );
    if (new Set(outputIds).size !== outputIds.length) {
      throw new Error("Merge output IDs must be unique.");
    }
    return { kind: "merge", outputIds };
  }
  if (edit.kind === "captions") {
    const languageCode = edit.languageCode
      ? assertStudioClipsBoundedText(edit.languageCode, {
          label: "Caption language",
          maxLength: 20,
        })
      : undefined;
    const styleSnapshotJson = edit.styleSnapshotJson
      ? normalizeStudioClipsSafeJsonSnapshot(
          edit.styleSnapshotJson,
          STUDIO_CLIPS_PERSISTENCE_LIMITS.captionStyleSnapshotBytes,
        ).json
      : undefined;
    return {
      burnIn: edit.burnIn,
      enabled: edit.enabled,
      kind: "captions",
      ...(languageCode ? { languageCode } : {}),
      ...(edit.style
        ? {
            style: normalizeStudioClipsCaptionStyle(
              edit.style,
              ownerId,
              productId,
            ),
          }
        : {}),
      ...(styleSnapshotJson ? { styleSnapshotJson } : {}),
    };
  }
  if (edit.kind === "project_style") {
    return {
      kind: "project_style",
      snapshotJson: normalizeStudioClipsSafeJsonSnapshot(
        edit.snapshotJson,
        STUDIO_CLIPS_PERSISTENCE_LIMITS.editSnapshotBytes,
      ).json,
    };
  }
  if (edit.kind === "regenerate") {
    const instructions = edit.instructions
      ? assertStudioClipsBoundedText(edit.instructions, {
          label: "Regeneration instructions",
          maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.textCharacters,
        })
      : undefined;
    return { kind: "regenerate", ...(instructions ? { instructions } : {}) };
  }
  return edit;
}
