type SearchableAsset = {
  avatarDescription?: string;
  mainPersonDescription?: string;
  outfitDescription?: string;
  locationDescription?: string;
  poseDescription?: string;
  productDescription?: string;
  videoDescription?: string;
  name: string;
  originalName?: string;
  tags?: string[];
};

export function getAssetSearchText(asset: SearchableAsset) {
  return [
    asset.name,
    asset.originalName,
    asset.avatarDescription,
    asset.mainPersonDescription,
    asset.outfitDescription,
    asset.locationDescription,
    asset.poseDescription,
    asset.productDescription,
    asset.videoDescription,
    ...(asset.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
