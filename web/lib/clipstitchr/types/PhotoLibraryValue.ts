import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { CreateAvatarOptions } from "@/lib/clipstitchr/types/CreateAvatarOptions";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export type PhotoLibraryValue = {
  avatars: Avatar[];
  defaultAvatarId?: string;
  defaultCliprVoiceId: string;
  photos: PhotoAssetMetadata[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createAvatar: (options: CreateAvatarOptions) => Promise<Avatar>;
  loadPhoto: (id: string) => Promise<PhotoAsset | null>;
  saveFiles: (
    files: FileList | File[],
    options?: {
      avatarId?: string;
      avatarName?: string;
      shouldExpandWithAi?: boolean;
    },
  ) => Promise<boolean>;
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
  renameAvatar: (avatar: Avatar, name: string) => Promise<void>;
  updateAvatarWardrobeStyle: (
    avatar: Avatar,
    wardrobeStyle: Avatar["wardrobeStyle"],
  ) => Promise<void>;
  updateAvatarCliprVoice: (
    avatar: Avatar,
    cliprVoiceId: Avatar["cliprVoiceId"],
  ) => Promise<void>;
  updateAvatarProduct: (avatar: Avatar, productId: string) => Promise<void>;
  setDefaultAvatar: (avatar: Avatar) => Promise<void>;
  setDefaultCliprVoice: (cliprVoiceId: string) => Promise<void>;
  removeAvatar: (id: string) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
};
