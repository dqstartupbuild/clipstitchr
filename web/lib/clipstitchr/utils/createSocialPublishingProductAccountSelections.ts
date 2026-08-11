import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { getAvailableSocialPublishingAccountIds } from "@/lib/clipstitchr/utils/getAvailableSocialPublishingAccountIds";

export function createSocialPublishingProductAccountSelections(
  products: ProductProfile[],
  accounts: SocialPublishingSocialAccount[],
) {
  return Object.fromEntries(
    products.map((product) => [
      product.id,
      getAvailableSocialPublishingAccountIds(
        accounts,
        product.socialPublishingSocialAccountIds ?? [],
      ),
    ]),
  );
}
