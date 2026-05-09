"use client";

import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { GeneratedAvatarPhoto } from "@/lib/clipstitchr/types/GeneratedAvatarPhoto";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { createBlobFromDataUrl } from "@/lib/clipstitchr/utils/createBlobFromDataUrl";

type GenerateAvatarPhotosOptions = {
  avatar: PhotoAsset;
  avatarDescription: string;
  count: AvatarPhotoGenerationCount;
  generationSpeedTier?: GenerationSpeedTier;
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
  count,
  generationSpeedTier,
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
  formData.set("count", String(count));
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
