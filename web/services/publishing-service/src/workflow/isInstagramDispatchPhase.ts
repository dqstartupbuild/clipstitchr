import type { InstagramPublishCheckpoint } from "../provider-runtime/instagram/InstagramPublishCheckpoint.js";

export const isInstagramDispatchPhase = (
  checkpoint: InstagramPublishCheckpoint | undefined,
): boolean =>
  checkpoint === undefined ||
  checkpoint.phase === "create_child" ||
  checkpoint.phase === "create_parent" ||
  checkpoint.phase === "ready_to_publish";
