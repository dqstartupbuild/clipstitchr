import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";

export function getStudioClipsHumanLimitations(
  capabilities: StudioClipsCapabilities,
) {
  const limitations = [
    "Edited and platform-specific versions run as separate render revisions, one clip job at a time per Product.",
    "YouTube links stay limited to supported YouTube video pages.",
    "Deleting a task removes it from this history but keeps its stored media.",
  ];

  if (capabilities.execution.state === "unavailable") {
    limitations.unshift("A saved task will wait until processing is enabled in this environment.");
  } else {
    limitations.unshift("Clip processing runs separately and can take several minutes.");
  }

  return limitations;
}
