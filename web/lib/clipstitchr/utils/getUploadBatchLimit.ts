import { MAX_EXPANDED_PHOTO_UPLOAD_BATCH_SIZE } from "@/lib/clipstitchr/constants/maxExpandedPhotoUploadBatchSize";
import { MAX_PHOTO_UPLOAD_BATCH_SIZE } from "@/lib/clipstitchr/constants/maxPhotoUploadBatchSize";
import { MAX_VIDEO_UPLOAD_BATCH_SIZE } from "@/lib/clipstitchr/constants/maxVideoUploadBatchSize";
import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";

type GetUploadBatchLimitOptions = {
  assetType: UploadAssetType;
  shouldExpandWithAi: boolean;
};

export function getUploadBatchLimit({
  assetType,
  shouldExpandWithAi,
}: GetUploadBatchLimitOptions) {
  if (assetType === "photo") {
    return shouldExpandWithAi
      ? MAX_EXPANDED_PHOTO_UPLOAD_BATCH_SIZE
      : MAX_PHOTO_UPLOAD_BATCH_SIZE;
  }

  return MAX_VIDEO_UPLOAD_BATCH_SIZE;
}
