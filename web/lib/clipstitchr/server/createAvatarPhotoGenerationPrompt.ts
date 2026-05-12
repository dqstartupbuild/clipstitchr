import { getAvatarPhotoGenerationModelFamily } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelFamily";
import { getAvatarLightingPrompt } from "@/lib/clipstitchr/utils/getAvatarLightingPrompt";
import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarIdentityMode } from "@/lib/clipstitchr/types/AvatarIdentityMode";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { getAvatarStylePrompt } from "@/lib/clipstitchr/utils/getAvatarStylePrompt";

type CreateAvatarPhotoGenerationPromptOptions = {
  avatarDescription: string;
  identityMode?: AvatarIdentityMode;
  modelId?: string;
  variant: AvatarGenerationVariant;
};

export function createAvatarPhotoGenerationPrompt({
  avatarDescription,
  identityMode = "same",
  modelId = "openai/gpt-image-2",
  variant,
}: CreateAvatarPhotoGenerationPromptOptions) {
  const modelFamily = getAvatarPhotoGenerationModelFamily(modelId);
  const referenceLabel =
    modelFamily === "pruna-z-image-turbo-img2img"
      ? "input image"
      : "reference image";
  const styleLine = getAvatarStylePrompt(variant.style as AvatarStyleOption);
  const lightingLine = getAvatarLightingPrompt(variant.lighting);
  const realWorldPhotoLine =
    variant.style === "ugc"
      ? "The image should be a creator-style UGC source photo: raw source material for a UGC ad, believable, not a studio portrait, and not overly posed."
      : "The image should feel like a casual real-world photo, not a synthetic studio render.";
  const modelWorkflowLines =
    modelFamily === "pruna-z-image-turbo-img2img"
      ? [
          "Use the input image as the image-to-image source.",
          "Transform the wardrobe, location, pose, and lighting according to the requested new photo instead of only retouching the original scene.",
        ]
      : [];
  const identityLines =
    identityMode === "similar"
      ? [
          `Create exactly one standalone realistic photo of a new fictional person inspired by the ${referenceLabel}.`,
          "The new person should share broad non-sensitive visual traits with the reference, but must have a noticeably different facial identity.",
          `Do not clone, preserve, or duplicate the exact face from the ${referenceLabel}.`,
        ]
      : [
          `Create exactly one standalone realistic photo of the same person from the ${referenceLabel}.`,
          `Preserve the person's facial identity, face shape, hair, skin tone, and other stable non-sensitive visual traits from the ${referenceLabel}.`,
        ];

  return [
    ...identityLines,
    ...modelWorkflowLines,
    realWorldPhotoLine,
    `Avatar description: ${avatarDescription}`,
    `Outfit for this new photo: ${variant.outfitDescription}.`,
    `Location or situation for this new photo: ${variant.locationDescription}.`,
    `Pose or action for this new photo: ${variant.poseDescription}.`,
    `Style: ${styleLine}.`,
    `Lighting: ${lightingLine}.`,
    "Do not copy the source photo outfit, background, location, or pose unless it naturally matches the requested new photo.",
    "Do not make a collage, grid, diptych, triptych, contact sheet, poster, app screen, social media UI, advertisement, illustration, painting, or graphic design.",
    "No text, captions, usernames, logos, watermarks, borders, UI controls, or typography.",
    "The output must contain one complete photo only, not multiple panels or multiple alternate images inside the frame.",
  ].join("\n");
}
