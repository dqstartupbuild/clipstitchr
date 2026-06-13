import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { cliprDemoVideoModelId } from "@/lib/clipstitchr/constants/cliprDemoVideoModelId";
import { getCliprAvatarVideoModelId } from "@/lib/clipstitchr/server/getCliprAvatarVideoModelId";
import { getCliprVideoModelSupportsMode } from "@/lib/clipstitchr/utils/getCliprVideoModelSupportsMode";

const defaultVisualModelId: Exclude<
  CliprVideoModelId,
  "auto" | "prunaai/p-video-avatar"
> = "kwaivgi/kling-v3-video";

export function getResolvedCliprVideoModelId({
  mode,
  requestedModelId,
}: {
  mode: CliprResolvedGenerationMode;
  requestedModelId: CliprVideoModelId;
}): Exclude<CliprVideoModelId, "auto"> {
  if (mode === "demo") {
    return cliprDemoVideoModelId;
  }

  if (
    requestedModelId !== "auto" &&
    getCliprVideoModelSupportsMode(requestedModelId, mode)
  ) {
    return requestedModelId;
  }

  if (mode === "script") {
    return getCliprAvatarVideoModelId();
  }

  return defaultVisualModelId;
}
