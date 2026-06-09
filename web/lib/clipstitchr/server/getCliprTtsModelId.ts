import { cliprTtsModelOptions } from "@/lib/clipstitchr/constants/cliprTtsModelOptions";
import { defaultCliprTtsModelId } from "@/lib/clipstitchr/constants/defaultCliprTtsModelId";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";

function getAllowedCliprTtsModelId(value: string) {
  return cliprTtsModelOptions.some((option) => option.value === value)
    ? (value as CliprTtsModelId)
    : undefined;
}

export function getCliprTtsModelId(value?: unknown): CliprTtsModelId {
  if (typeof value === "string") {
    const requestedModelId = getAllowedCliprTtsModelId(value.trim());

    if (requestedModelId) {
      return requestedModelId;
    }
  }

  return (
    getAllowedCliprTtsModelId(process.env.CLIPR_TTS_MODEL_ID ?? "") ??
    defaultCliprTtsModelId
  );
}
