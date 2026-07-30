"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductSocialAccountSelectionForm } from "./ProductSocialAccountSelectionForm";
import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";

type ProductSocialAccountSelectorProps = {
  productId: string;
  productName: string;
};

export function ProductSocialAccountSelector({
  productId,
  productName,
}: ProductSocialAccountSelectorProps) {
  const { isAuthenticated } = useConvexAuth();
  const [savedProductId, setSavedProductId] = useState<string | null>(null);
  const accounts = useQuery(
    api.socialAccounts.listSocialAccounts.listSocialAccounts,
    isAuthenticated ? {} : "skip",
  );
  const selections = useQuery(
    api.productSocialAccounts.listProductSocialAccounts
      .listProductSocialAccounts,
    isAuthenticated ? { productId } : "skip",
  );

  return (
    <section aria-labelledby="product-social-accounts">
      <h3
        className="text-base font-bold text-text-primary"
        id="product-social-accounts"
      >
        Default accounts
      </h3>
      <p className="mt-1 text-sm leading-6 text-text-secondary">
        New posts for {productName} start with these accounts selected. You can
        still change them before scheduling.
      </p>
      {accounts === undefined || selections === undefined ? (
        <p className="mt-3 text-sm font-semibold text-text-secondary">
          Loading accounts...
        </p>
      ) : (
        <ProductSocialAccountSelectionForm
          key={`${productId}:${selections.map((selection) => selection.socialAccountId).join(",")}`}
          accounts={accounts as SocialComposeAccount[]}
          initialSelectedIds={selections.map(
            (selection) => selection.socialAccountId,
          )}
          onSaved={() => setSavedProductId(productId)}
          productId={productId}
        />
      )}
      {savedProductId === productId ? (
        <p className="mt-3 text-sm font-semibold text-emerald-300">
          Default accounts saved for {productName}.
        </p>
      ) : null}
    </section>
  );
}
