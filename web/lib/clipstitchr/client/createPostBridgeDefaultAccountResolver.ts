import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import type { PostBridgeDefaultAccountSelection } from "@/lib/clipstitchr/types/PostBridgeDefaultAccountSelection";

export function createPostBridgeDefaultAccountResolver() {
  const cache = new Map<string, Promise<PostBridgeDefaultAccountSelection>>();

  return async function resolvePostBridgeDefaultAccounts(
    productId?: string,
  ): Promise<PostBridgeDefaultAccountSelection> {
    const cacheKey = productId ?? "";
    const cachedSelection = cache.get(cacheKey);

    if (cachedSelection) {
      return cachedSelection;
    }

    const selectionPromise = fetchPostBridgeAccountOptions(productId).then(
      (options) => {
        if (!options.defaultSocialAccountIds.length) {
          throw new Error(
            "Save Post Bridge accounts for this product before bulk queueing.",
          );
        }

        const selectedIdSet = new Set(options.defaultSocialAccountIds);
        const selectedAccounts = options.accounts.filter((account) =>
          selectedIdSet.has(account.id),
        );

        if (selectedAccounts.length !== selectedIdSet.size) {
          throw new Error(
            "Update this product's Post Bridge accounts before bulk queueing.",
          );
        }

        return {
          platforms: selectedAccounts.map((account) => account.platform),
          socialAccountIds: options.defaultSocialAccountIds,
        };
      },
    );

    cache.set(cacheKey, selectionPromise);

    return selectionPromise;
  };
}
