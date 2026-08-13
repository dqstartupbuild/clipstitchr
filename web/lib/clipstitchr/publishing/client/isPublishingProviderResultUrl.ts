import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

const hostsByProvider: Record<PublishingProvider, readonly string[]> = {
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
};

export function isPublishingProviderResultUrl(
  provider: PublishingProvider,
  value: string | null,
): boolean {
  if (value === null) {
    return true;
  }
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.hash === "" &&
      hostsByProvider[provider].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
}
