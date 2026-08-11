export function normalizeSocialPublishingTikTokPhotoTitle(value: string) {
  return value.trim().slice(0, 90);
}
