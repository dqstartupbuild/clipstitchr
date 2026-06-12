import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

export function getCliprReplicateDuration({
  durationSeconds,
  modelId,
}: {
  durationSeconds: number;
  modelId: Exclude<CliprVideoModelId, "auto">;
}) {
  if (modelId === "google/veo-3.1") {
    return durationSeconds <= 4 ? 4 : durationSeconds <= 6 ? 6 : 8;
  }

  if (modelId === "openai/sora-2" || modelId === "openai/sora-2-pro") {
    return durationSeconds <= 4 ? 4 : 8;
  }

  return Math.min(10, Math.max(4, Math.round(durationSeconds)));
}
