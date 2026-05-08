type SearchableAsset = {
  name: string;
  originalName?: string;
  tags?: string[];
};

export function getAssetSearchText(asset: SearchableAsset) {
  return [asset.name, asset.originalName, ...(asset.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
