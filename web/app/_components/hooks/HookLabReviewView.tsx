"use client";

import { useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { HookLabLiveRegion } from "@/app/_components/hooks/HookLabLiveRegion";
import { HookLabReviewFilters } from "@/app/_components/hooks/HookLabReviewFilters";
import { HookLabReviewGrid } from "@/app/_components/hooks/HookLabReviewGrid";
import type { HookLabReviewState } from "@/lib/clipstitchr/types/HookLabReviewState";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { useHookLabReviewOptions } from "@/lib/clipstitchr/hooks/useHookLabReviewOptions";

type HookLabReviewViewProps = {
  activeProductId?: string;
  products: ProductProfile[];
  savingIdeaId: string | null;
  onSaveIdea: (id: string, productId?: string) => Promise<void>;
};

export function HookLabReviewView({
  activeProductId,
  products,
  savingIdeaId,
  onSaveIdea,
}: HookLabReviewViewProps) {
  const [productId, setProductId] = useState(activeProductId ?? "");
  const [reviewState, setReviewState] =
    useState<HookLabReviewState>("needs_review");
  const review = useHookLabReviewOptions({
    productId: productId || undefined,
    reviewState,
  });

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-balance text-2xl font-bold text-text-primary">
          Review hooks one at a time
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-text-secondary">
          Use a hook on its Stitch, save it as a reusable idea, or tell
          ClipStitchr it is not for you. Sibling hooks stay unchanged.
        </p>
      </div>
      <HookLabReviewFilters
        productId={productId}
        products={products}
        reviewState={reviewState}
        onProductIdChange={setProductId}
        onReviewStateChange={setReviewState}
      />
      {review.error ? (
        <DashboardAlert variant="error">{review.error}</DashboardAlert>
      ) : null}
      <HookLabReviewGrid
        canLoadMore={review.canLoadMore}
        isLoading={review.isLoading}
        isLoadingMore={review.isLoadingMore}
        options={review.options}
        savingOptionId={review.savingOptionId ?? savingIdeaId}
        onLoadMore={review.loadMore}
        onMarkNotForMe={(id) => {
          void review.markNotForMe(id).catch(() => undefined);
        }}
        onSaveIdea={(id, optionProductId) => {
          void onSaveIdea(id, optionProductId).catch(() => undefined);
        }}
        onUndo={(id) => {
          void review.undo(id).catch(() => undefined);
        }}
        onUse={(id) => {
          void review.select(id).catch(() => undefined);
        }}
      />
      <HookLabLiveRegion message={review.statusMessage} />
    </div>
  );
}
