import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export type PhotoLibraryValue = {
  avatars: Avatar[];
  photos: PhotoAssetMetadata[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadPhoto: (id: string) => Promise<PhotoAsset | null>;
  saveFiles: (
    files: FileList | File[],
    options?: {
      avatarId?: string;
      avatarName?: string;
      shouldExpandWithAi?: boolean;
    },
  ) => Promise<void>;
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
  updatePhotoMetadata: (
    photo: PhotoAssetMetadata,
    metadata: AssetMetadataUpdate,
  ) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
};
