import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";

type ActiveCliprLipSyncModelId = Exclude<CliprLipSyncModelId, "none">;

export function getCliprLipSyncSegmentSeconds(
  modelId: ActiveCliprLipSyncModelId,
) {
  if (modelId === "pixverse/lipsync") {
    return 30;
  }

  return null;
}
