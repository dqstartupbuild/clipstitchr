export function assertValidBlogImageSourceUrl(sourceUrl: string) {
  let url: URL;

  try {
    url = new URL(sourceUrl.trim());
  } catch {
    throw new Error("Blog image URLs must use http or https.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Blog image URLs must use http or https.");
  }

  return url;
}
