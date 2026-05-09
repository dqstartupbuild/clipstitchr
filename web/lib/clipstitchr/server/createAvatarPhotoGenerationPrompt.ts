import { getAvatarLightingPrompt } from "@/lib/clipstitchr/utils/getAvatarLightingPrompt";
import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { getAvatarStylePrompt } from "@/lib/clipstitchr/utils/getAvatarStylePrompt";

type CreateAvatarPhotoGenerationPromptOptions = {
  avatarDescription: string;
  variant: AvatarGenerationVariant;
};

export function createAvatarPhotoGenerationPrompt({
  avatarDescription,
  variant,
}: CreateAvatarPhotoGenerationPromptOptions) {
  const styleLine = getAvatarStylePrompt(variant.style as AvatarStyleOption);
  const lightingLine = getAvatarLightingPrompt(variant.lighting);

  return [
    "Create exactly one standalone realistic portrait photo of the same person from the reference image.",
    "The image should feel like a casual real-world photo the avatar could have taken themselves.",
    "Preserve the person's facial identity, face shape, hair, skin tone, and other stable non-sensitive visual traits from the reference.",
    `Avatar description: ${avatarDescription}`,
    `Outfit for this new photo: ${variant.outfitDescription}.`,
    `Location or situation for this new photo: ${variant.locationDescription}.`,
    `Style: ${styleLine}.`,
    `Lighting: ${lightingLine}.`,
    "Do not copy the source photo outfit, background, location, or pose unless it naturally matches the requested new photo.",
    "Do not make a collage, grid, diptych, triptych, contact sheet, poster, app screen, social media UI, advertisement, illustration, painting, or graphic design.",
    "No text, captions, usernames, logos, watermarks, borders, UI controls, or typography.",
    "The output must contain one complete photo only, not multiple panels or multiple alternate images inside the frame.",
  ].join("\n");
}
