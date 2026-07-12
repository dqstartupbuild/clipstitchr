"use client";

import { SlidersHorizontal } from "lucide-react";
import { useCallback, useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { HookLabIdeaDefaultsDialog } from "@/app/_components/hooks/HookLabIdeaDefaultsDialog";
import { HookLabIdeasView } from "@/app/_components/hooks/HookLabIdeasView";
import { HookLabLiveRegion } from "@/app/_components/hooks/HookLabLiveRegion";
import { HookLabReviewView } from "@/app/_components/hooks/HookLabReviewView";
import { HookLabViewTabs } from "@/app/_components/hooks/HookLabViewTabs";
import { HookLabWritingPreferencesDialog } from "@/app/_components/hooks/HookLabWritingPreferencesDialog";
import { Button } from "@/app/_components/ui/Button";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useHookLabDefaults } from "@/lib/clipstitchr/hooks/useHookLabDefaults";
import { useHookLabIdeaActions } from "@/lib/clipstitchr/hooks/useHookLabIdeaActions";
import { useHookLabView } from "@/lib/clipstitchr/hooks/useHookLabView";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";
import type { HookLabPendingIdeaUse } from "@/lib/clipstitchr/types/HookLabPendingIdeaUse";
import type { HookLabWritingPreferencesInput } from "@/lib/clipstitchr/types/HookLabWritingPreferencesInput";
import { createProductProfileInputFromProduct } from "@/lib/clipstitchr/utils/createProductProfileInputFromProduct";

export function HookLabPageClient() {
  const products = useDashboardProduct();
  const { setView, view } = useHookLabView();
  const ideaActions = useHookLabIdeaActions();
  const defaults = useHookLabDefaults(products.activeProductId ?? undefined);
  const [isWritingPreferencesOpen, setIsWritingPreferencesOpen] =
    useState(false);
  const [pendingUse, setPendingUse] =
    useState<HookLabPendingIdeaUse | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const handleUseIdea = useCallback(
    (idea: HookLabIdea, variationCount: HookLabIdeaVariationCount) => {
      const productId = products.activeProductId;

      setPageError(null);

      if (!productId) {
        setPageError("Choose an active product before using an idea.");
        return;
      }

      if (!defaults.defaults) {
        setPageError(
          defaults.isLoading
            ? "Your product choices are still loading. Try again in a moment."
            : "Add an avatar and product demo before using this idea.",
        );
        return;
      }

      if (
        !defaults.defaults.defaultAvatarId ||
        !defaults.defaults.defaultDemoClipId
      ) {
        setPendingUse({ idea, variationCount });
        return;
      }

      void ideaActions
        .useIdea(idea.id, productId, variationCount)
        .catch(() => undefined);
    },
    [defaults.defaults, defaults.isLoading, ideaActions, products.activeProductId],
  );
  const handleSaveWritingPreferences = useCallback(
    async (input: HookLabWritingPreferencesInput) => {
      const product = products.activeProduct;

      if (!product) {
        throw new Error("Choose an active product first.");
      }

      await products.updateProduct(product.id, {
        ...createProductProfileInputFromProduct(product),
        ...input,
      });
      setPageMessage("Writing preferences saved.");
    },
    [products],
  );
  const error = pageError ?? products.error ?? ideaActions.error;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Create and learn"
          title="Hook Lab"
          description="Save something worth repeating, then turn it into a fresh Stitch for the product you are working on."
          actions={
            <Button
              type="button"
              variant="secondary"
              icon={<SlidersHorizontal aria-hidden className="size-4" />}
              disabled={!products.activeProduct}
              onClick={() => setIsWritingPreferencesOpen(true)}
            >
              Writing preferences
            </Button>
          }
        />
        <HookLabViewTabs value={view} onChange={setView} />
        {error ? (
          <DashboardAlert variant="error">{error}</DashboardAlert>
        ) : null}
        {view === "ideas" ? (
          <HookLabIdeasView
            activeProductId={products.activeProductId ?? undefined}
            archivingIdeaId={ideaActions.archivingIdeaId}
            currentUseIdsByIdeaId={ideaActions.currentUseIdsByIdeaId}
            deletingIdeaId={ideaActions.deletingIdeaId}
            error={ideaActions.error}
            isCreating={ideaActions.isCreating}
            retryingIdeaId={ideaActions.retryingIdeaId}
            savingIdeaId={ideaActions.savingIdeaId}
            usingIdeaId={ideaActions.usingIdeaId}
            onArchive={(id) => {
              void ideaActions.archive(id).catch(() => undefined);
            }}
            onCreateFromStitch={ideaActions.createFromStitch}
            onCreateFromValue={ideaActions.createFromValue}
            onDelete={ideaActions.remove}
            onRetry={(id) => {
              void ideaActions.retry(id).catch(() => undefined);
            }}
            onUpdate={ideaActions.update}
            onUse={handleUseIdea}
          />
        ) : (
          <HookLabReviewView
            key={products.activeProductId ?? "all-products"}
            activeProductId={products.activeProductId ?? undefined}
            products={products.products}
            savingIdeaId={ideaActions.savingIdeaId}
            onSaveIdea={ideaActions.createFromHookOption}
          />
        )}
      </div>
      <HookLabLiveRegion
        message={pageMessage ?? ideaActions.statusMessage}
      />
      {isWritingPreferencesOpen && products.activeProduct ? (
        <HookLabWritingPreferencesDialog
          key={products.activeProduct.id}
          isSaving={products.isSaving}
          product={products.activeProduct}
          onClose={() => setIsWritingPreferencesOpen(false)}
          onSave={handleSaveWritingPreferences}
        />
      ) : null}
      {pendingUse && defaults.defaults && products.activeProductId ? (
        <HookLabIdeaDefaultsDialog
          defaults={defaults.defaults}
          error={ideaActions.error}
          isUsing={ideaActions.usingIdeaId === pendingUse.idea.id}
          onClose={() => setPendingUse(null)}
          onContinue={(resolvedDefaults) => {
            void ideaActions
              .useIdea(
                pendingUse.idea.id,
                products.activeProductId ?? "",
                pendingUse.variationCount,
                resolvedDefaults,
              )
              .then(() => setPendingUse(null))
              .catch(() => undefined);
          }}
        />
      ) : null}
    </DashboardShell>
  );
}
