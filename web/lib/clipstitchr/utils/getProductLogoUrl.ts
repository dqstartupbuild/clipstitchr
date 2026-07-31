export function getProductLogoUrl(websiteUrl?: string) {
  if (!websiteUrl) {
    return undefined;
  }

  try {
    const url = new URL(websiteUrl);

    if (url.protocol !== "https:") {
      return undefined;
    }

    return new URL("/favicon.ico", url.origin).toString();
  } catch {
    return undefined;
  }
}
