import { getCliprVisualVideoModelId } from "@/lib/clipstitchr/server/getCliprVisualVideoModelId";

export function getHookLabVisualVideoModelId() {
  const configured = getCliprVisualVideoModelId("reaction");

  return configured === "google/veo-3.1"
    ? configured
    : ("kwaivgi/kling-v3-video" as const);
}
