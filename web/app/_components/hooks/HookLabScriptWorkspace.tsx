"use client";

import { useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { HookLabProductAdaptationEditor } from "@/app/_components/hooks/HookLabProductAdaptationEditor";
import { HookLabProductAdaptationPreview } from "@/app/_components/hooks/HookLabProductAdaptationPreview";
import { Button } from "@/app/_components/ui/Button";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import type { HookLabProductAdaptationController } from "@/lib/clipstitchr/types/HookLabProductAdaptationController";
import { formatHookLabProductAdaptation } from "@/lib/clipstitchr/utils/formatHookLabProductAdaptation";

export function HookLabScriptWorkspace({
  adaptation,
  onGenerate,
}: {
  adaptation: HookLabProductAdaptationController;
  onGenerate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!adaptation.brief) {
    return (
      <div className="mx-auto grid w-full max-w-2xl place-items-start gap-5 py-6 sm:py-12">
        <div>
          <h3 className="text-balance text-2xl font-bold text-text-primary">
            Create your product script
          </h3>
          <p className="mt-3 text-pretty text-base leading-7 text-text-secondary">
            Hook Lab will rewrite this exact video for the product active in
            your dashboard. The finished script stays here for reading, editing,
            and copying.
          </p>
          <p className="mt-3 text-pretty text-sm leading-6 text-text-secondary">
            {adaptation.activeProductIsUsable && adaptation.activeProduct
              ? `Writing for ${adaptation.activeProduct.name}. Generation uses 1 creation credit.`
              : "Select an available product with the dashboard product picker first."}
          </p>
        </div>
        <Button
          disabled={!adaptation.activeProductIsUsable}
          isLoading={adaptation.isGenerating}
          type="button"
          onClick={onGenerate}
        >
          Use this format
        </Button>
        {adaptation.error ? (
          <div className="w-full">
            <DashboardAlert variant="error">{adaptation.error}</DashboardAlert>
          </div>
        ) : null}
      </div>
    );
  }

  const scriptProductName =
    adaptation.briefProductName ?? adaptation.activeProduct?.name ?? "your product";
  const activeProductDiffers = Boolean(
    adaptation.activeProduct &&
      adaptation.brief.productId !== adaptation.activeProduct.id,
  );

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-accent-dark">
            Script for {scriptProductName}
          </p>
          <h3 className="mt-1 text-balance text-2xl font-bold text-text-primary">
            {isEditing ? "Edit your script" : "Your script"}
          </h3>
          {activeProductDiffers && adaptation.activeProduct ? (
            <p className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              Your active product is now {adaptation.activeProduct.name}.
              Regenerate only when you want a new version for that product.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={!adaptation.activeProductIsUsable}
            isLoading={adaptation.isGenerating}
            size="sm"
            type="button"
            variant="subtle"
            onClick={onGenerate}
          >
            {activeProductDiffers && adaptation.activeProduct
              ? `Remake for ${adaptation.activeProduct.name}`
              : "Regenerate"}
          </Button>
          {!isEditing ? (
            <CopyTextButton
              label="Copy script"
              text={formatHookLabProductAdaptation(adaptation.brief.brief)}
            />
          ) : null}
          <Button
            isLoading={adaptation.isSaving}
            size="sm"
            type="button"
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
                return;
              }

              void adaptation
                .saveEdits()
                .then((didSave) => didSave && setIsEditing(false));
            }}
          >
            {isEditing ? "Save edits" : "Edit script"}
          </Button>
        </div>
      </header>

      {adaptation.error ? (
        <DashboardAlert variant="error">{adaptation.error}</DashboardAlert>
      ) : null}
      {adaptation.savedMessage ? (
        <p className="text-pretty text-sm font-semibold text-accent-dark" role="status">
          {adaptation.savedMessage}
        </p>
      ) : null}

      {isEditing ? (
        <HookLabProductAdaptationEditor
          adaptation={adaptation.brief.brief}
          onChange={adaptation.updateContent}
        />
      ) : (
        <HookLabProductAdaptationPreview adaptation={adaptation.brief.brief} />
      )}
    </div>
  );
}
