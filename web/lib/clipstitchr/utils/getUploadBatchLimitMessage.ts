import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";

type GetUploadBatchLimitMessageOptions = {
  assetType: UploadAssetType;
  limit: number;
  shouldExpandWithAi: boolean;
};

export function getUploadBatchLimitMessage({
  assetType,
  limit,
  shouldExpandWithAi,
}: GetUploadBatchLimitMessageOptions) {
  if (assetType === "photo" && shouldExpandWithAi) {
    return "AI-expanded photos can be uploaded one at a time.";
  }

  const assetLabel = assetType === "photo" ? "photos" : "videos";

  return `Choose up to ${limit} ${assetLabel} at once.`;
}
