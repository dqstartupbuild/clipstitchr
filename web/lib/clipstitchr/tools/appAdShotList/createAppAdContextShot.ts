import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function createAppAdContextShot(input: AppAdShotListInput): AppAdShot {
  const isDirectToCamera = input.creatorStyle === "direct-to-camera";

  return {
    action: isDirectToCamera
      ? `Describe the real moment when ${input.problem.trim()} using one short thought.`
      : `Show one simple physical moment that represents this frustration: ${input.problem.trim()}.`,
    audioDirection: isDirectToCamera
      ? "Use natural speech and stop cleanly after the thought."
      : "Capture silently so this context can work beneath different hooks or overlay text.",
    duration: "3–6 seconds",
    framing: isDirectToCamera
      ? "Vertical chest-up frame with steady eyeline."
      : "Vertical medium or detail shot with one visible action.",
    group: "context",
    handoff:
      "Keep this as a separate clean file with one beat and no product interface burned into it.",
    id: "CONTEXT-01",
    purpose:
      "Give future openings a recognizable before-moment without locking it to one edit.",
    source: isDirectToCamera ? "creator" : "b-roll",
    title: "Problem context",
  };
}
