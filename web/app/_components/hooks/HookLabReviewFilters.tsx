"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { HookLabReviewState } from "@/lib/clipstitchr/types/HookLabReviewState";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type HookLabReviewFiltersProps = {
  productId: string;
  products: ProductProfile[];
  reviewState: HookLabReviewState;
  onProductIdChange: (productId: string) => void;
  onReviewStateChange: (state: HookLabReviewState) => void;
};

export function HookLabReviewFilters({
  productId,
  products,
  reviewState,
  onProductIdChange,
  onReviewStateChange,
}: HookLabReviewFiltersProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 sm:items-end">
      <SelectInput
        label="Product"
        value={productId}
        options={[
          { label: "All products", value: "" },
          ...products.map((product) => ({
            label: product.name,
            value: product.id,
          })),
        ]}
        onChange={(event) => onProductIdChange(event.currentTarget.value)}
      />
      <SelectInput
        label="Review status"
        value={reviewState}
        options={[
          { label: "Needs review", value: "needs_review" },
          { label: "Saved", value: "saved" },
          { label: "Not for me", value: "not_for_me" },
        ]}
        onChange={(event) =>
          onReviewStateChange(event.currentTarget.value as HookLabReviewState)
        }
      />
    </div>
  );
}
