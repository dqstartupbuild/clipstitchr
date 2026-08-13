import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";

export function getStudioClipsExecutionMessage(
  capabilities: StudioClipsCapabilities,
) {
  return capabilities.execution.state === "available"
    ? "Clip processing is ready."
    : "Clip processing is unavailable in this environment.";
}
