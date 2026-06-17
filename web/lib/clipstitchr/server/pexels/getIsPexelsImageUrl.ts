export function getIsPexelsImageUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname === "images.pexels.com";
  } catch {
    return false;
  }
}
