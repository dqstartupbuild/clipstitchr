export function normalizeSocialPublishingMediaMimeType(mimeType: string) {
  return mimeType.split(";")[0].trim().toLowerCase();
}
