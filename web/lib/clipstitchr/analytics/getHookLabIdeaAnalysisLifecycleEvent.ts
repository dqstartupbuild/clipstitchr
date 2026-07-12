import type { HookLabIdeaStatus } from "@/lib/clipstitchr/types/HookLabIdeaStatus";
import type { HookLabLifecycleEventName } from "@/lib/clipstitchr/types/HookLabLifecycleEventName";

export function getHookLabIdeaAnalysisLifecycleEvent(
  previousStatus: HookLabIdeaStatus,
  status: HookLabIdeaStatus,
): HookLabLifecycleEventName | null {
  if (previousStatus !== "analyzing") {
    return null;
  }

  if (status === "ready") {
    return "hook_lab_idea_analysis_completed";
  }

  if (status === "failed" || status === "needs_attention") {
    return "hook_lab_idea_analysis_failed";
  }

  return null;
}
