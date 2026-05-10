"use client";

import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarIdentityMode } from "@/lib/clipstitchr/types/AvatarIdentityMode";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationReference } from "@/lib/clipstitchr/types/AvatarPhotoGenerationReference";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { GeneratedAvatarPhoto } from "@/lib/clipstitchr/types/GeneratedAvatarPhoto";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { createBlobFromDataUrl } from "@/lib/clipstitchr/utils/createBlobFromDataUrl";

type GenerateAvatarPhotosOptions = {
  avatar: AvatarPhotoGenerationReference;
  avatarDescription: string;
  context: string;
  count: AvatarPhotoGenerationCount;
  generationSpeedTier?: GenerationSpeedTier;
  identityMode?: AvatarIdentityMode;
  lighting: AvatarLightingOption;
  location: string;
  style: AvatarStyleOption;
};

type GenerateAvatarPhotosResponse = {
  images?: GeneratedAvatarPhoto[];
  message?: string;
  modelId?: string;
  prompts?: string[];
};

export async function generateAvatarPhotos({
  avatar,
  avatarDescription,
  context,
  count,
  generationSpeedTier,
  identityMode = "same",
  lighting,
  location,
  style,
}: GenerateAvatarPhotosOptions) {
  const formData = new FormData();

  formData.set(
    "image",
    new File([avatar.blob], `${avatar.name}.jpg`, {
      type: avatar.blob.type || avatar.mimeType || "image/jpeg",
    }),
  );
  formData.set("avatarDescription", avatarDescription);
  formData.set("context", context);
  formData.set("count", String(count));
  formData.set("identityMode", identityMode);
  if (generationSpeedTier) {
    formData.set("generationSpeedTier", generationSpeedTier);
  }
  formData.set("lighting", lighting);
  formData.set("location", location);
  formData.set("style", style);

  const response = await fetch("/api/avatars/photos/generate", {
    method: "POST",
    body: formData,
  });
  const body = (await response.json()) as GenerateAvatarPhotosResponse;

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to generate avatar photos.");
  }

  const images = Array.isArray(body.images) ? body.images : [];
  const generatedPhotos = await Promise.all(
    images.map(async (image) => ({
      blob: await createBlobFromDataUrl(image.dataUrl),
      variant: image.variant,
    })),
  );

  return {
    generatedPhotos,
    modelId: body.modelId,
    prompts: body.prompts ?? [],
  };
}
