import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { InstagramPublishCheckpoint } from "../provider-runtime/instagram/InstagramPublishCheckpoint.js";
import type { StoredInstagramPublishCheckpoint } from "./StoredInstagramPublishCheckpoint.js";
import { isNullablePublishingCheckpointString } from "./isNullablePublishingCheckpointString.js";

const PHASES = new Set<StoredInstagramPublishCheckpoint["phase"]>([
  "create_child",
  "create_child_dispatched",
  "wait_child",
  "create_parent",
  "create_parent_dispatched",
  "wait_parent",
  "ready_to_publish",
  "publish_dispatched",
  "published",
]);

export const decodeInstagramPublishCheckpoint = (
  value: unknown,
): InstagramPublishCheckpoint => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ProviderRuntimeError("instagram", "invalid_request");
  }
  const checkpoint = value as Partial<StoredInstagramPublishCheckpoint>;

  if (
    typeof checkpoint.attemptKey !== "string" ||
    typeof checkpoint.accountId !== "string" ||
    !Number.isInteger(checkpoint.mediaCount) ||
    (checkpoint.mediaCount ?? 0) < 1 ||
    typeof checkpoint.phase !== "string" ||
    !PHASES.has(checkpoint.phase as StoredInstagramPublishCheckpoint["phase"]) ||
    !Array.isArray(checkpoint.childContainerIds) ||
    !checkpoint.childContainerIds.every((id) => typeof id === "string") ||
    !Number.isInteger(checkpoint.nextMediaIndex) ||
    (checkpoint.nextMediaIndex ?? -1) < 0 ||
    !isNullablePublishingCheckpointString(checkpoint.activeContainerId) ||
    !isNullablePublishingCheckpointString(checkpoint.parentContainerId) ||
    !isNullablePublishingCheckpointString(checkpoint.mediaId) ||
    !isNullablePublishingCheckpointString(checkpoint.permalink)
  ) {
    throw new ProviderRuntimeError("instagram", "invalid_request");
  }

  return Object.freeze({
    attemptKey: checkpoint.attemptKey,
    accountId: checkpoint.accountId,
    mediaCount: checkpoint.mediaCount as number,
    phase: checkpoint.phase as StoredInstagramPublishCheckpoint["phase"],
    childContainerIds: Object.freeze([...checkpoint.childContainerIds]),
    nextMediaIndex: checkpoint.nextMediaIndex as number,
    activeContainerId: checkpoint.activeContainerId ?? undefined,
    parentContainerId: checkpoint.parentContainerId ?? undefined,
    mediaId: checkpoint.mediaId ?? undefined,
    permalink: checkpoint.permalink ?? undefined,
  });
};
