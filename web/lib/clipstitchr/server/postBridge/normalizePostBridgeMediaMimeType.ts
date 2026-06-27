export function normalizePostBridgeMediaMimeType(mimeType: string) {
  return mimeType.split(";")[0].trim().toLowerCase();
}
