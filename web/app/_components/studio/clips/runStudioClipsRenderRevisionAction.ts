import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";

export async function runStudioClipsRenderRevisionAction(
  revision: StudioClipsRenderRevisionSummary,
  action: "cancel" | "resume",
  updateRevision: (
    revision: StudioClipsRenderRevisionSummary,
    action: "cancel" | "resume",
  ) => Promise<unknown>,
  onUpdated: () => void,
) {
  if (await updateRevision(revision, action)) {
    onUpdated();
  }
}
