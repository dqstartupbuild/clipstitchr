import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function createAppAdOutcomeShot(input: AppAdShotListInput): AppAdShot {
  return {
    action: `Capture one believable after-moment that suggests the desire to ${input.desiredOutcome.trim()} without acting out a guaranteed result.`,
    audioDirection:
      input.creatorStyle === "direct-to-camera"
        ? "Use one grounded reflection in your own words."
        : "Keep this silent and let the visible change carry the beat.",
    duration: "2–5 seconds",
    framing:
      "Vertical medium shot with a distinct expression or single action near the center.",
    group: "outcome",
    handoff:
      "Stop after one clear beat and leave the file free of captions, music, and transitions.",
    id: "OUTCOME-01",
    purpose:
      "Provide a reusable payoff visual without turning it into a finished ad ending.",
    source: input.creatorStyle === "direct-to-camera" ? "creator" : "b-roll",
    title: "Outcome moment",
  };
}
