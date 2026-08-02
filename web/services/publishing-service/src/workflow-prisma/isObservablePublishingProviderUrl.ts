import { assertObservableProviderUrl } from "../persistence/assertObservableProviderUrl.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";

export const isObservablePublishingProviderUrl = (
  provider: PublishingProvider,
  value: string,
): boolean => {
  try {
    assertObservableProviderUrl(value);
    const hostname = new URL(value).hostname.toLowerCase();
    const expectedDomain =
      provider === "tiktok" ? "tiktok.com" : "instagram.com";

    return (
      hostname === expectedDomain || hostname.endsWith(`.${expectedDomain}`)
    );
  } catch {
    return false;
  }
};
