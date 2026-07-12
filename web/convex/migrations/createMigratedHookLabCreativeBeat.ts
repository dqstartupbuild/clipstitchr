import type { Doc } from "../_generated/dataModel";
import type { HookLabCreativeBeat } from "../../lib/clipstitchr/types/HookLabCreativeBeat";

export function createMigratedHookLabCreativeBeat(
  sourceClip: Doc<"videoClips"> | null,
): HookLabCreativeBeat {
  const openingVisualState =
    sourceClip?.videoDescription ??
    sourceClip?.poseDescription ??
    "A clear, relatable reaction opens the video.";

  return {
    beats: [
      {
        approximateStartSeconds: 0,
        description:
          sourceClip?.poseDescription ??
          "Open with a simple reaction that makes the hook feel believable.",
      },
    ],
    bodyGesture: sourceClip?.poseDescription,
    emotionalTurn: "Move from recognition or surprise into the product payoff.",
    genericObjects: [],
    mustNotCopy: [
      "Do not copy a source person's identity, room, clothes, logos, or exact shots.",
    ],
    openingVisualState,
    payoff: "The reaction flows naturally into the saved Demo setup.",
    transitionIntoDemo: "Cut into the product Demo after the opening reaction.",
  };
}
