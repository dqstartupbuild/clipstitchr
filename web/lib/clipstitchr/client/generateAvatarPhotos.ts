"use client";

import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarIdentityMode } from "@/lib/clipstitchr/types/AvatarIdentityMode";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationReference } from "@/lib/clipstitchr/types/AvatarPhotoGenerationReference";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

type GenerateAvatarPhotosOptions = {
  avatar: AvatarPhotoGenerationReference;
  avatarId?: string;
  avatarName?: string;
  avatarDescription: string;
  context: string;
  count: AvatarPhotoGenerationCount;
  generationSpeedTier?: GenerationSpeedTier;
  identityMode?: AvatarIdentityMode;
  lighting: AvatarLightingOption;
  location: string;
  outfit?: string;
  style: AvatarStyleOption;
  wardrobeStyle?: AvatarWardrobeStyle;
};

type GenerateAvatarPhotosResponse = {
  job?: { id: string; status: string };
  message?: string;
  modelId?: string;
  queuedCount?: number;
};

export async function generateAvatarPhotos({
  avatar,
  avatarId,
  avatarName,
  avatarDescription,
  context,
  count,
  generationSpeedTier,
  identityMode = "same",
  lighting,
  location,
  outfit = "",
  style,
  wardrobeStyle = "any",
}: GenerateAvatarPhotosOptions) {
  const formData = new FormData();

  formData.set(
    "image",
    new File([avatar.blob], `${avatar.name}.jpg`, {
      type: avatar.blob.type || avatar.mimeType || "image/jpeg",
    }),
  );
  formData.set("avatarId", avatarId ?? "");
  formData.set("avatarName", avatarName ?? avatar.name);
  formData.set("avatarDescription", avatarDescription);
  formData.set("context", context);
  formData.set("count", String(count));
  formData.set("identityMode", identityMode);
  if (generationSpeedTier) {
    formData.set("generationSpeedTier", generationSpeedTier);
  }
  formData.set("lighting", lighting);
  formData.set("location", location);
  formData.set("outfit", outfit);
  formData.set("style", style);
  formData.set("wardrobeStyle", wardrobeStyle);

  const response = await fetch("/api/avatars/photos/generate", {
    method: "POST",
    body: formData,
  });
  const body = (await response.json()) as GenerateAvatarPhotosResponse;

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to generate avatar photos.");
  }

  return {
    generatedPhotos: [],
    job: body.job,
    modelId: body.modelId,
    queuedCount: body.queuedCount ?? count,
  };
}
