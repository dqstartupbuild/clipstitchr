import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function createAppAdCtaShot(input: AppAdShotListInput): AppAdShot {
  const usesSilentVisual = input.creatorStyle === "reaction-and-b-roll";

  return {
    action: usesSilentVisual
      ? `Capture one inviting gesture or action that can support this later text: ${input.callToAction.trim()}.`
      : `Invite this honest next step: ${input.callToAction.trim()}.`,
    audioDirection: usesSilentVisual
      ? "Keep this visual take silent so the approved next step can be added later."
      : "Record the approved call to action exactly enough to preserve its meaning. Do not add fake urgency.",
    duration: "2–5 seconds",
    framing: usesSilentVisual
      ? "Use a vertical medium or detail shot with one centered closing action."
      : "Match the main creator framing and hold eye contact through the final word.",
    group: "call-to-action",
    handoff:
      "Deliver the CTA separately so it can be kept, replaced, or omitted during production.",
    id: "CTA-01",
    purpose:
      "Keep the next step reusable instead of locking it into every opening.",
    source: usesSilentVisual ? "b-roll" : "creator",
    title: "Call to action",
  };
}
