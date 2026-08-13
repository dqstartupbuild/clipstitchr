export function getLazyReelStringIsUrl(value: string) {
  try {
    return new URL(value).protocol.length > 0;
  } catch {
    return false;
  }
}
