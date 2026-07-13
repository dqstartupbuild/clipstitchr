import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";
import { getAppAdOpeningDirection } from "@/lib/clipstitchr/tools/appAdShotList/getAppAdOpeningDirection";

export function createAppAdOpeningShots(
  input: AppAdShotListInput,
): AppAdShot[] {
  const mainDirection = getAppAdOpeningDirection(input);
  const variationDirections = [
    mainDirection,
    `Capture a second opening through one concrete detail from this moment: ${input.problem.trim()}.`,
    `Contrast the before-moment with the desired after-state: ${input.desiredOutcome.trim()}.`,
    `Create a clean visual reason to hand off to ${input.productMoment.trim()}.`,
    `Try the same idea with less setup and a faster first action.`,
  ];

  return variationDirections
    .slice(0, input.openingCount)
    .map((action, index) => {
      const usesSilentVisual =
        input.creatorStyle === "reaction-and-b-roll" ||
        (input.creatorStyle === "mixed" && index % 2 === 1);

      return {
        action,
        audioDirection: usesSilentVisual
          ? "No spoken claim. Let one expression or physical action carry the opening so text can be added later."
          : "Say one natural thought in your own words. Do not memorize a long script or add proof that was not supplied.",
        duration: usesSilentVisual ? "2–5 seconds" : "3–8 seconds",
        framing: usesSilentVisual
          ? "Vertical medium or close detail shot with the important action near the center."
          : "Vertical chest-up frame, steady eyeline, and clean room around the face for later text.",
        group: "opening",
        handoff:
          "Leave a clean beat at both ends. Deliver this opening as its own file with no app screen, music, captions, watermark, or transition baked in.",
        id: `HOOK-${String(index + 1).padStart(2, "0")}`,
        purpose:
          "Create a standalone UGC opening that can be tested before the same product demo.",
        source: usesSilentVisual ? "b-roll" : "creator",
        title: `Opening option ${index + 1}`,
      };
    });
}
