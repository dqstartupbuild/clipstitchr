"use client";

import { useCallback, useState } from "react";
import { generateAvatarPhotos } from "@/lib/clipstitchr/client/generateAvatarPhotos";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { PhotoLibraryValue } from "@/lib/clipstitchr/types/PhotoLibraryValue";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type UseCreateAvatarFromUgcClipOptions = {
  createAvatar: PhotoLibraryValue["createAvatar"];
  loadClip: (id: string) => Promise<VideoClip | null>;
  saveGeneratedPhotos: PhotoLibraryValue["saveGeneratedPhotos"];
};

export function useCreateAvatarFromUgcClip({
  createAvatar,
  loadClip,
}: UseCreateAvatarFromUgcClipOptions) {
  const [createdAvatar, setCreatedAvatar] = useState<Avatar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(
    async (clip: VideoClipMetadata, options: CreateAvatarFromUgcClipOptions) => {
      const avatarName = options.avatarName.trim();
      const avatarDescription = options.avatarDescription.trim();

      if (clip.clipType !== "ugc") {
        setError("Choose a UGC clip before creating an avatar.");
        return null;
      }

      if (!avatarName) {
        setError("Avatar name is required.");
        return null;
      }

      if (!avatarDescription) {
        setError("Add a person description before creating an avatar.");
        return null;
      }

      setCreatedAvatar(null);
      setError(null);
      setGeneratedCount(0);
      setIsGenerating(true);

      try {
        const posterBlob =
          clip.posterBlob ?? (await loadClip(clip.id))?.posterBlob;

        if (!posterBlob) {
          throw new Error("This clip needs a poster before creating an avatar.");
        }

        const avatar = await createAvatar({
          description: avatarDescription,
          name: avatarName,
        });
        const result = await generateAvatarPhotos({
          avatar: {
            blob: posterBlob,
            mimeType: posterBlob.type || "image/jpeg",
            name: clip.name,
          },
          avatarId: avatar.id,
          avatarName: avatar.name,
          avatarDescription,
          context: options.context,
          count: options.count,
          identityMode: options.identityMode,
          lighting: options.lighting,
          location: options.location,
          style: options.style,
        });

        setCreatedAvatar(avatar);
        setGeneratedCount(result.queuedCount);
        return avatar;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to create an avatar from this UGC clip.",
        );
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [createAvatar, loadClip],
  );

  return {
    createdAvatar,
    error,
    generate,
    generatedCount,
    isGenerating,
  };
}
