const DEFAULT_MAX_SOCIAL_POST_BYTES = 1024 * 1024 * 1024;
const MAX_CONFIGURABLE_SOCIAL_POST_BYTES = 4 * 1024 * 1024 * 1024;

export function getMaxSocialPostBytes() {
  const configured = Number(process.env.SOCIAL_MAX_POST_BYTES);

  return Number.isFinite(configured) && configured > 0
    ? Math.min(configured, MAX_CONFIGURABLE_SOCIAL_POST_BYTES)
    : DEFAULT_MAX_SOCIAL_POST_BYTES;
}
