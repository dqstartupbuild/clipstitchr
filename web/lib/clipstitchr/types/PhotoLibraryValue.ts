import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export type PhotoLibraryValue = {
  photos: PhotoAssetMetadata[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadPhoto: (id: string) => Promise<PhotoAsset | null>;
  saveFiles: (
    files: FileList | File[],
    options?: {
      shouldExpandWithAi?: boolean;
    },
  ) => Promise<void>;
  updatePhotoMetadata: (
    photo: PhotoAssetMetadata,
    metadata: AssetMetadataUpdate,
  ) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
};
