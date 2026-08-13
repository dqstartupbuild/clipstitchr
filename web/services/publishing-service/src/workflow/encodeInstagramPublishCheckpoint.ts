import type { InstagramPublishCheckpoint } from "../provider-runtime/instagram/InstagramPublishCheckpoint.js";
import type { StoredInstagramPublishCheckpoint } from "./StoredInstagramPublishCheckpoint.js";

export const encodeInstagramPublishCheckpoint = (
  checkpoint: InstagramPublishCheckpoint,
): StoredInstagramPublishCheckpoint =>
  Object.freeze({
    attemptKey: checkpoint.attemptKey,
    accountId: checkpoint.accountId,
    mediaCount: checkpoint.mediaCount,
    phase: checkpoint.phase,
    childContainerIds: Object.freeze([...checkpoint.childContainerIds]),
    nextMediaIndex: checkpoint.nextMediaIndex,
    activeContainerId: checkpoint.activeContainerId ?? null,
    parentContainerId: checkpoint.parentContainerId ?? null,
    mediaId: checkpoint.mediaId ?? null,
    permalink: checkpoint.permalink ?? null,
  });
