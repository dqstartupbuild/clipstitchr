type SearchableAsset = {
  avatarDescription?: string;
  outfitDescription?: string;
  locationDescription?: string;
  poseDescription?: string;
  name: string;
  originalName?: string;
  tags?: string[];
};

export function getAssetSearchText(asset: SearchableAsset) {
  return [
    asset.name,
    asset.originalName,
    asset.avatarDescription,
    asset.outfitDescription,
    asset.locationDescription,
    asset.poseDescription,
    ...(asset.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
