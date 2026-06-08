import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarSceneControls } from "@/lib/clipstitchr/types/AvatarSceneControls";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export function createCliprAvatarStillVariant(
  scene: CliprScenePlan,
  controls: AvatarSceneControls = {},
): AvatarGenerationVariant {
  const locationDescription = controls.location?.trim() || scene.visualPrompt;
  const poseDescription = controls.pose?.trim()
    ? `${controls.pose.trim()}. The person should be framed as a natural talking-head creator ready to say: ${scene.scriptText}`
    : `${scene.visualPrompt}. The person should be framed as a natural talking-head creator ready to say: ${scene.scriptText}`;

  return {
    outfitDescription:
      controls.outfit?.trim() ||
      "context-appropriate creator clothing that fits the location, action, and script moment; use practical activewear for gym or fitness scenes; avoid unrelated formal, office, streetwear, or fashion outfits",
    locationDescription,
    poseDescription,
    lighting: "natural",
    style: "ugc",
  };
}
