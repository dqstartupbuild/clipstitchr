import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarSceneControls } from "@/lib/clipstitchr/types/AvatarSceneControls";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export function createCliprAvatarStillVariant(
  scene: CliprScenePlan,
  controls: AvatarSceneControls = {},
  mode: CliprResolvedGenerationMode = "script",
): AvatarGenerationVariant {
  const locationDescription = controls.location?.trim() || scene.visualPrompt;
  const fallbackPose =
    mode === "reaction"
      ? `${scene.visualPrompt}. Frame the person as a natural close-up reaction shot with readable face and hand movement. The person is not speaking.`
      : mode === "broll"
        ? `${scene.visualPrompt}. Frame the person doing one clear day-in-the-life action with enough body and environment visible to understand the activity. The person is not speaking.`
        : `${scene.visualPrompt}. The person should be framed as a natural talking-head creator ready to say: ${scene.scriptText}`;
  const poseDescription = controls.pose?.trim()
    ? `${controls.pose.trim()}. ${fallbackPose}`
    : fallbackPose;
  const outfitDescription =
    controls.outfit?.trim() ||
    (mode === "broll"
      ? "practical day-in-the-life clothing or work gear that fits the product category, activity, and location"
      : "context-appropriate creator clothing that fits the location, action, and script moment; use practical activewear for gym or fitness scenes; avoid unrelated formal, office, streetwear, or fashion outfits");

  return {
    outfitDescription,
    locationDescription,
    poseDescription,
    lighting: "natural",
    style: "ugc",
  };
}
