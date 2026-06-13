import { getCliprVideoModelId } from "@/lib/clipstitchr/utils/getCliprVideoModelId";
import { getCliprVideoModelSupportsMode } from "@/lib/clipstitchr/utils/getCliprVideoModelSupportsMode";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

const defaultCliprVisualVideoModelId = "kwaivgi/kling-v3-video" as const;

export function getCliprVisualVideoModelId(
  mode: Extract<CliprResolvedGenerationMode, "reaction" | "broll">,
): Exclude<CliprVideoModelId, "auto"> {
  const configuredModelId = getCliprVideoModelId(
    process.env.CLIPR_VISUAL_VIDEO_MODEL_ID,
  );

  if (
    configuredModelId !== "auto" &&
    getCliprVideoModelSupportsMode(configuredModelId, mode)
  ) {
    return configuredModelId;
  }

  return defaultCliprVisualVideoModelId;
}
