export function getAssetDownloadFileName(name: string, extension: string) {
  const cleanName = name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-");
  const normalizedName = cleanName.replace(/^-+|-+$/g, "").toLowerCase();

  return `${normalizedName || "clipr-asset"}.${extension}`;
}
