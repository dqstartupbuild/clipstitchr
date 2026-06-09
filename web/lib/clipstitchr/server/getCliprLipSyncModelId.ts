import { cliprLipSyncModelOptions } from "@/lib/clipstitchr/constants/cliprLipSyncModelOptions";
import { defaultCliprLipSyncModelId } from "@/lib/clipstitchr/constants/defaultCliprLipSyncModelId";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";

function getAllowedCliprLipSyncModelId(value: string) {
  return cliprLipSyncModelOptions.some((option) => option.value === value)
    ? (value as CliprLipSyncModelId)
    : undefined;
}

export function getCliprLipSyncModelId(value?: unknown): CliprLipSyncModelId {
  if (typeof value === "string") {
    const requestedModelId = getAllowedCliprLipSyncModelId(value.trim());

    if (requestedModelId) {
      return requestedModelId;
    }
  }

  return (
    getAllowedCliprLipSyncModelId(process.env.CLIPR_LIP_SYNC_MODEL_ID ?? "") ??
    defaultCliprLipSyncModelId
  );
}
