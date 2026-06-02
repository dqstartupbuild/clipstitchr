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
    modelFamily === "minimax-image-01"
      ? "subject reference image"
      : "reference image";
  const styleLine = getAvatarStylePrompt(variant.style as AvatarStyleOption);
  const lightingLine = getAvatarLightingPrompt(variant.lighting);
  const realWorldPhotoLine =
    variant.style === "ugc"
      ? "The image should be a creator-style UGC source photo: raw source material for a UGC ad, believable, not a studio portrait, and not overly posed."
      : "The image should feel like a casual real-world photo, not a synthetic studio render.";
  const ugcFramingLines =
    variant.style === "ugc"
      ? [
          "Frame the person as a tight vertical front-camera reaction selfie, like a phone held at arm's length for a short-form UGC clip.",
          "Use close talking-head composition: head, face, neck, shoulders, and maybe upper chest only. The face should occupy roughly 35-55% of the image height.",
          "The camera is very close to the person, around 1-2 feet away. Use a casual phone lens perspective with slight arm's-length selfie distortion.",
          "Keep the top of the hair close to the top edge, with very little intentional background. The outfit and location are supporting context, not the subject.",
          "Treat outfit, props, and background as minor hints only; do not compose the image to display them.",
          "If any outfit, background, prop, or pose detail would require showing more than the head, shoulders, and upper chest, ignore that detail and keep the close reaction framing.",
          "Do not show the person holding large props, notebooks, balloons, keys, bags, cups, or tools unless the user's pose explicitly requests it.",
          "Do not zoom out into a waist-up, full-body, fashion, editorial, commercial, or location-focused portrait. Do not show legs, feet, or the full outfit.",
        ]
      : [];
  const modelWorkflowLines =
    modelFamily === "minimax-image-01"
      ? [
          "Use the subject reference image as the character reference for the generated person.",
          "Preserve the subject reference person's facial identity while generating a new wardrobe, location, pose, and lighting.",
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
    ...ugcFramingLines,
    `Avatar description: ${avatarDescription}`,
    `Outfit for this new photo: ${variant.outfitDescription}.`,
    `Background/location for this new photo: ${variant.locationDescription}.`,
    `Primary body pose/action for this new photo: ${variant.poseDescription}.`,
    "Use the background/location as setting context only. Do not let it override the primary body pose/action.",
    "If the background and pose/action seem to conflict, follow the primary body pose/action and keep the background as a plausible setting.",
    `Style: ${styleLine}.`,
    `Lighting: ${lightingLine}.`,
    "Do not copy the source photo outfit, background, location, or pose unless it naturally matches the requested new photo.",
    "Do not make a collage, grid, diptych, triptych, contact sheet, poster, app screen, social media UI, advertisement, illustration, painting, or graphic design.",
    "No text, captions, usernames, logos, watermarks, borders, UI controls, or typography.",
    "The output must contain one complete photo only, not multiple panels or multiple alternate images inside the frame.",
  ].join("\n");
}
