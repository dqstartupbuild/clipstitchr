export function getStableBlogImageSourceId(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);

    return `${url.origin}${url.pathname}`;
  } catch {
    return sourceUrl;
  }
}
