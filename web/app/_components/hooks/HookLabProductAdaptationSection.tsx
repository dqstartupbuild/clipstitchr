"use client";

import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { HookLabProductAdaptationEditor } from "@/app/_components/hooks/HookLabProductAdaptationEditor";
import { Button } from "@/app/_components/ui/Button";
import { useHookLabProductAdaptation } from "@/lib/clipstitchr/hooks/useHookLabProductAdaptation";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function HookLabProductAdaptationSection({ post }: { post: HookLabPost }) {
  const adaptation = useHookLabProductAdaptation(post.id);

  return (
    <section aria-labelledby="hook-lab-product-adaptation">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h3
            className="text-xl font-bold text-text-primary"
            id="hook-lab-product-adaptation"
          >
            Remake it for your product
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Use this format rewrites this exact scene plan for the product active
            in the dashboard. Each generation or regeneration costs 1 creation
            credit. Editing and copying are free.
          </p>
        </div>
        <Button
          disabled={!adaptation.activeProductIsUsable}
          isLoading={adaptation.isGenerating}
          type="button"
          onClick={() => void adaptation.generate()}
        >
          {adaptation.brief ? "Regenerate" : "Use this format"}
        </Button>
      </div>

      {adaptation.activeProductIsUsable && adaptation.activeProduct ? (
        <p className="mt-4 text-sm font-semibold text-text-primary">
          Writing for {adaptation.activeProduct.name}
        </p>
      ) : (
        <div className="mt-4">
          <DashboardAlert variant="info">
            Select an available product from the dashboard product picker to use
            this format.
          </DashboardAlert>
        </div>
      )}

      {adaptation.error ? (
        <div className="mt-4">
          <DashboardAlert variant="error">{adaptation.error}</DashboardAlert>
        </div>
      ) : null}
      {adaptation.savedMessage ? (
        <p className="mt-4 text-sm font-semibold text-accent-dark" role="status">
          {adaptation.savedMessage}
        </p>
      ) : null}

      {adaptation.brief ? (
        <HookLabProductAdaptationEditor
          adaptation={adaptation.brief.brief}
          isSaving={adaptation.isSaving}
          onChange={adaptation.updateContent}
          onSave={() => void adaptation.saveEdits()}
        />
      ) : null}
    </section>
  );
}
