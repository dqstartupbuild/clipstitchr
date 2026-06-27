"use client";

import { PackagePlus, X } from "lucide-react";
import { useState } from "react";
import { ProductHookMemoryFields } from "@/app/_components/hooks/ProductHookMemoryFields";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { parseProductHookExamplesText } from "@/lib/clipstitchr/utils/parseProductHookExamplesText";

type ProductCreateDialogProps = {
  isRequired?: boolean;
  isSaving: boolean;
  onClose?: () => void;
  onCreate: (input: ProductProfileCreateInput) => Promise<ProductProfile>;
};

export function ProductCreateDialog({
  isRequired = false,
  isSaving,
  onClose,
  onCreate,
}: ProductCreateDialogProps) {
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [audienceDetails, setAudienceDetails] = useState("");
  const [winningHookExamplesText, setWinningHookExamplesText] = useState("");
  const [rejectedHookExamplesText, setRejectedHookExamplesText] = useState("");
  const [hookGenerationGoal, setHookGenerationGoal] =
    useState<HookGenerationGoal>("views");
  const [hookEdgeLevel, setHookEdgeLevel] = useState<HookEdgeLevel>("punchy");
  const [error, setError] = useState<string | null>(null);
  const canSave =
    name.trim().length > 0 &&
    (!isRequired ||
      parseProductHookExamplesText(winningHookExamplesText).length > 0) &&
    !isSaving;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/60 px-3 py-4 sm:items-center sm:px-4 sm:py-6"
      onClick={isRequired ? undefined : onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-create-dialog-title"
        className="max-h-full w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={async (event) => {
          event.preventDefault();

          if (!canSave) {
            return;
          }

          setError(null);

          try {
            await onCreate({
              name,
              websiteUrl: websiteUrl || undefined,
              productDetails,
              audienceDetails,
              winningHookExamples: parseProductHookExamplesText(
                winningHookExamplesText,
              ),
              rejectedHookExamples: parseProductHookExamplesText(
                rejectedHookExamplesText,
              ),
              hookGenerationGoal,
              hookEdgeLevel,
            });
            onClose?.();
          } catch (nextError) {
            setError(
              nextError instanceof Error
                ? nextError.message
                : "Unable to save this product.",
            );
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent-dark">Product</p>
            <h2
              id="product-create-dialog-title"
              className="mt-1 text-xl font-bold text-text-primary"
            >
              {isRequired ? "Create your first product" : "Add a product"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Tell ClipStitchr what you make so your clips, avatars, and
              automation stay organized.
            </p>
          </div>
          {!isRequired && onClose ? (
            <IconButton
              type="button"
              label="Close"
              icon={<X aria-hidden className="h-4 w-4" />}
              onClick={onClose}
            />
          ) : null}
        </div>
        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Product name
            </span>
            <input
              value={name}
              maxLength={120}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Guppy Calisthenics"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Website
            </span>
            <input
              value={websiteUrl}
              maxLength={2048}
              inputMode="url"
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="https://example.com"
              onChange={(event) => setWebsiteUrl(event.currentTarget.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              What should people know?
            </span>
            <textarea
              value={productDetails}
              maxLength={2000}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="What it does, who it helps, and why people care."
              onChange={(event) => setProductDetails(event.currentTarget.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Who is it for?
            </span>
            <textarea
              value={audienceDetails}
              maxLength={2000}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="The people you want to reach and what they struggle with."
              onChange={(event) => setAudienceDetails(event.currentTarget.value)}
            />
          </label>
          <ProductHookMemoryFields
            hookEdgeLevel={hookEdgeLevel}
            hookGenerationGoal={hookGenerationGoal}
            rejectedHookExamplesText={rejectedHookExamplesText}
            winningHookExamplesText={winningHookExamplesText}
            isWinningRequired={isRequired}
            onHookEdgeLevelChange={setHookEdgeLevel}
            onHookGenerationGoalChange={setHookGenerationGoal}
            onRejectedHookExamplesTextChange={setRejectedHookExamplesText}
            onWinningHookExamplesTextChange={setWinningHookExamplesText}
          />
        </div>
        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            icon={<PackagePlus aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!canSave}
          >
            Save product
          </Button>
        </div>
      </form>
    </div>
  );
}
