"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type ProductSettingsEditDialogProps = {
  product: ProductProfile;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: ProductProfileCreateInput) => Promise<unknown>;
};

export function ProductSettingsEditDialog({
  product,
  isSaving,
  onClose,
  onSave,
}: ProductSettingsEditDialogProps) {
  const [name, setName] = useState(product.name);
  const [productDetails, setProductDetails] = useState(product.productDetails);
  const [audienceDetails, setAudienceDetails] = useState(
    product.audienceDetails,
  );
  const canSave = name.trim().length > 0 && !isSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <form
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-surface p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${product.name}`}
        onSubmit={async (event) => {
          event.preventDefault();

          if (!canSave) {
            return;
          }

          try {
            await onSave({ name, productDetails, audienceDetails });
          } catch {
            return;
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Saved product
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-text-primary">
              Edit product context
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:border-accent hover:text-accent"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Product name
            </span>
            <input
              value={name}
              maxLength={120}
              className="mt-1.5 h-9 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Product or offer"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-text-primary">
                Product details
              </span>
              <textarea
                value={productDetails}
                maxLength={2000}
                rows={5}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-5 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
                placeholder="Benefits, proof points, offer, constraints."
                onChange={(event) =>
                  setProductDetails(event.currentTarget.value)
                }
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text-primary">
                Audience details
              </span>
              <textarea
                value={audienceDetails}
                maxLength={2000}
                rows={5}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-5 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
                placeholder="Audience, pains, buying triggers, language."
                onChange={(event) =>
                  setAudienceDetails(event.currentTarget.value)
                }
              />
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            icon={<Save aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!canSave}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
