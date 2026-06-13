import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { cliprDemoVideoModelId } from "@/lib/clipstitchr/constants/cliprDemoVideoModelId";
import { getCliprAvatarVideoModelId } from "@/lib/clipstitchr/server/getCliprAvatarVideoModelId";
import { getCliprVisualVideoModelId } from "@/lib/clipstitchr/server/getCliprVisualVideoModelId";
import { getCliprVideoModelSupportsMode } from "@/lib/clipstitchr/utils/getCliprVideoModelSupportsMode";

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

  if (mode === "reaction" || mode === "broll") {
    return getCliprVisualVideoModelId(mode);
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

  return getCliprVisualVideoModelId("reaction");
}
