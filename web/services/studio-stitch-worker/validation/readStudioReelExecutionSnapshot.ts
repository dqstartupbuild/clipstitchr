import type { StudioReelExecutionSnapshot } from "../contracts/StudioReelExecutionSnapshot";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { isStudioReelCheckpointAssetRef } from "./isStudioReelCheckpointAssetRef";

export function readStudioReelExecutionSnapshot(
  snapshotJson: string,
): StudioReelExecutionSnapshot {
  let value: unknown;
  try {
    value = JSON.parse(snapshotJson);
  } catch {
    value = null;
  }
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new StudioReelWorkerError({
      code: "CHECKPOINT_SNAPSHOT_INVALID",
      kind: "permanent",
      publicMessage: "The Studio Stitch checkpoint snapshot is invalid.",
    });
  }
  const candidate = value as Record<string, unknown>;
  const reactionAssets = candidate.reactionAssets ?? [];
  const reactionSelections = candidate.reactionSelections ?? [];
  if (
    candidate.schemaVersion !== "studio-stitch-execution-v1" ||
    !Array.isArray(candidate.analyses) ||
    !Array.isArray(candidate.outputs) ||
    !Array.isArray(candidate.voices) ||
    !Array.isArray(reactionAssets) ||
    !Array.isArray(reactionSelections) ||
    candidate.analyses.length > 20 ||
    candidate.outputs.length > 20 ||
    candidate.voices.length > 20 ||
    reactionAssets.length > 100 ||
    reactionSelections.length > 100
  ) {
    throw new StudioReelWorkerError({
      code: "CHECKPOINT_SNAPSHOT_INVALID",
      kind: "permanent",
      publicMessage: "The Studio Stitch checkpoint snapshot is invalid.",
    });
  }
  candidate.reactionAssets = reactionAssets;
  candidate.reactionSelections = reactionSelections;
  const json = JSON.stringify(candidate);
  if (new TextEncoder().encode(json).byteLength > 128 * 1024) {
    throw new StudioReelWorkerError({
      code: "CHECKPOINT_SNAPSHOT_TOO_LARGE",
      kind: "permanent",
      publicMessage: "The Studio Stitch checkpoint snapshot is too large.",
    });
  }
  for (const output of candidate.outputs) {
    if (
      !output ||
      Array.isArray(output) ||
      typeof output !== "object" ||
      typeof (output as Record<string, unknown>).recipeId !== "string" ||
      typeof (output as Record<string, unknown>).objectKey !== "string" ||
      !/^[a-f0-9]{64}$/.test(
        String((output as Record<string, unknown>).sha256),
      )
    ) {
      throw new StudioReelWorkerError({
        code: "CHECKPOINT_OUTPUT_INVALID",
        kind: "permanent",
        publicMessage: "A Studio Stitch checkpoint output is invalid.",
      });
    }
  }
  for (const voice of candidate.voices) {
    if (
      !voice ||
      Array.isArray(voice) ||
      typeof voice !== "object" ||
      typeof (voice as Record<string, unknown>).recipeId !== "string" ||
      typeof (voice as Record<string, unknown>).objectKey !== "string" ||
      !/^[a-f0-9]{64}$/.test(String((voice as Record<string, unknown>).sha256)) ||
      !Array.isArray((voice as Record<string, unknown>).timelineWordTimings)
    ) {
      throw new StudioReelWorkerError({
        code: "CHECKPOINT_VOICE_INVALID",
        kind: "permanent",
        publicMessage: "A Studio Stitch checkpoint voice is invalid.",
      });
    }
  }
  for (const selection of reactionSelections) {
    const entry = selection as Record<string, unknown>;
    if (
      !selection ||
      Array.isArray(selection) ||
      typeof selection !== "object" ||
      !isStudioReelCheckpointAssetRef(entry.source) ||
      typeof entry.recipeId !== "string" ||
      typeof entry.videoId !== "string" ||
      typeof entry.modelId !== "string" ||
      typeof entry.title !== "string" ||
      typeof entry.price !== "number" ||
      !Number.isFinite(entry.price)
    ) {
      throw new StudioReelWorkerError({
        code: "CHECKPOINT_REACTION_SELECTION_INVALID",
        kind: "permanent",
        publicMessage: "A Studio Stitch reaction selection is invalid.",
      });
    }
  }
  for (const reaction of reactionAssets) {
    const entry = reaction as Record<string, unknown>;
    if (
      !reaction ||
      Array.isArray(reaction) ||
      typeof reaction !== "object" ||
      !isStudioReelCheckpointAssetRef(entry.source) ||
      entry.contentType !== "video/mp4" ||
      typeof entry.recipeId !== "string" ||
      typeof entry.videoId !== "string" ||
      typeof entry.modelId !== "string" ||
      typeof entry.objectKey !== "string" ||
      typeof entry.objectVersion !== "string" ||
      !/^[a-f0-9]{64}$/u.test(String(entry.sha256)) ||
      typeof entry.sizeBytes !== "number" ||
      !Number.isSafeInteger(entry.sizeBytes) ||
      typeof entry.durationSeconds !== "number" ||
      !Number.isFinite(entry.durationSeconds) ||
      typeof entry.width !== "number" ||
      typeof entry.height !== "number" ||
      typeof entry.hasAudio !== "boolean" ||
      typeof entry.pricePaid !== "number" ||
      typeof entry.currency !== "string" ||
      typeof entry.purchasedAt !== "string" ||
      !Number.isFinite(Date.parse(entry.purchasedAt))
    ) {
      throw new StudioReelWorkerError({
        code: "CHECKPOINT_REACTION_ASSET_INVALID",
        kind: "permanent",
        publicMessage: "A Studio Stitch reaction asset is invalid.",
      });
    }
  }
  return candidate as unknown as StudioReelExecutionSnapshot;
}
