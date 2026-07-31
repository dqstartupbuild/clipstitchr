const DEFAULT_MAX_SOCIAL_ASSET_BYTES = 500 * 1024 * 1024;
const MAX_CONFIGURABLE_SOCIAL_ASSET_BYTES = 4 * 1024 * 1024 * 1024;

export function getMaxSocialAssetBytes() {
  const configured = Number(process.env.SOCIAL_MAX_ASSET_BYTES);

  return Number.isFinite(configured) && configured > 0
    ? Math.min(configured, MAX_CONFIGURABLE_SOCIAL_ASSET_BYTES)
    : DEFAULT_MAX_SOCIAL_ASSET_BYTES;
}
