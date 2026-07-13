import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function createAppAdDemoShot(input: AppAdShotListInput): AppAdShot {
  return {
    action: `Start on a clean before-state, complete this one action without detours, then hold the visible result: ${input.productMoment.trim()}.`,
    audioDirection:
      "Record clean system sound only if it matters. Do not add music or creator narration to the screen recording.",
    duration: "5–12 seconds",
    framing:
      "Record the app at its clearest native orientation and keep the important labels readable on a phone.",
    group: "demo",
    handoff: `Deliver the ${input.appName.trim()} demo as its own uninterrupted file so it can follow different UGC openings.`,
    id: "DEMO-01",
    purpose:
      "Show the product action and its visible result with no competing side path.",
    source: "screen-demo",
    title: "Clean product demo",
  };
}
