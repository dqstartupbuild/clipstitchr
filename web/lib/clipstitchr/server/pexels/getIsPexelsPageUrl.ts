export function getIsPexelsPageUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      (url.hostname === "www.pexels.com" || url.hostname === "pexels.com")
    );
  } catch {
    return false;
  }
}
