export const normalizePublishingMediaPublicOrigin = (value: string): string => {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Publishing media requires an exact HTTPS origin.");
  }

  if (
    url.protocol !== "https:" ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.search.length > 0 ||
    url.hash.length > 0 ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    throw new Error("Publishing media requires an exact HTTPS origin.");
  }

  return url.origin;
};
