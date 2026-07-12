import type { HookLabIdeaUseStatus } from "@/lib/clipstitchr/types/HookLabIdeaUseStatus";
import type { HookLabLifecycleEventName } from "@/lib/clipstitchr/types/HookLabLifecycleEventName";

export function getHookLabIdeaUseLifecycleEvent(
  status: HookLabIdeaUseStatus,
): HookLabLifecycleEventName | null {
  if (status === "completed" || status === "partial") {
    return "hook_lab_idea_use_completed";
  }

  if (status === "failed") {
    return "hook_lab_idea_use_failed";
  }

  return null;
}
