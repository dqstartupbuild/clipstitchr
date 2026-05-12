import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export function createCliprAvatarStillVariant(
  scene: CliprScenePlan,
): AvatarGenerationVariant {
  return {
    outfitDescription:
      "casual creator clothing that fits the scene and looks believable for a UGC source photo",
    locationDescription: scene.visualPrompt,
    poseDescription:
      `${scene.visualPrompt}. The person should be framed as a natural talking-head creator ready to say: ${scene.scriptText}`,
    lighting: "natural",
    style: "ugc",
  };
}
