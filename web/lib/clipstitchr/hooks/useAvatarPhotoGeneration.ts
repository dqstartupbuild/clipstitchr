"use client";

import { useCallback, useState } from "react";
import { generateAvatarPhotos } from "@/lib/clipstitchr/client/generateAvatarPhotos";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type UseAvatarPhotoGenerationOptions = {
  loadPhoto: (id: string) => Promise<PhotoAsset | null>;
  saveGeneratedPhotos: (
    photos: {
      blob: Blob;
      variant: AvatarGenerationVariant;
    }[],
    options: {
      avatarId: string;
      sourceAvatarName: string;
    },
  ) => Promise<void>;
};

type GenerateAvatarPhotosFromSelectionOptions = {
  avatar: Avatar;
  context: string;
  count: AvatarPhotoGenerationCount;
  lighting: AvatarLightingOption;
  location: string;
  outfit?: string;
  referencePhoto: PhotoAssetMetadata;
  style: AvatarStyleOption;
};

export function useAvatarPhotoGeneration({
  loadPhoto,
}: UseAvatarPhotoGenerationOptions) {
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const generate = useCallback(
    async ({
      avatar,
      context,
      count,
      lighting,
      location,
      outfit,
      referencePhoto,
      style,
    }: GenerateAvatarPhotosFromSelectionOptions) => {
      const avatarDescription = avatar.description?.trim();

      if (!avatarDescription) {
        setError("Add an avatar description before generating photos.");
        return;
      }

      setError(null);
      setIsGenerating(true);
      setGeneratedCount(0);

      try {
        const loadedAvatar = await loadPhoto(referencePhoto.id);

        if (!loadedAvatar) {
          throw new Error("Unable to load the selected avatar.");
        }

        const result = await generateAvatarPhotos({
          avatar: loadedAvatar,
          avatarId: avatar.id,
          avatarName: avatar.name,
          avatarDescription,
          context,
          count,
          lighting,
          location,
          outfit,
          style,
          wardrobeStyle: avatar.wardrobeStyle,
        });

        setGeneratedCount(result.queuedCount);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to generate avatar photos.",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [loadPhoto],
  );

  return {
    error,
    generatedCount,
    generate,
    isGenerating,
  };
}
