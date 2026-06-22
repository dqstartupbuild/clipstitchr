"use client";

import { Check, Wand2 } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

type StitchrAutoTextPanelProps = {
  hookVariants: StitchrHookVariant[];
  isGenerating: boolean;
  message: string | null;
  products: ProductProfile[];
  selectedProductId: string;
  onApplyHookVariant: (text: string) => void;
  onGenerate: () => void;
  onProductChange: (productId: string) => void;
};

export function StitchrAutoTextPanel({
  hookVariants,
  isGenerating,
  message,
  products,
  selectedProductId,
  onApplyHookVariant,
  onGenerate,
  onProductChange,
}: StitchrAutoTextPanelProps) {
  return (
    <Panel className="p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SelectInput
          label="Product"
          value={selectedProductId}
          options={products.map((product) => ({
            label: product.name,
            value: product.id,
          }))}
          disabled={!products.length}
          onChange={(event) => onProductChange(event.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          icon={<Wand2 aria-hidden className="h-4 w-4" />}
          disabled={!products.length}
          isLoading={isGenerating}
          onClick={onGenerate}
        >
          Generate text
        </Button>
      </div>
      {hookVariants.length ? (
        <div className="mt-4 grid gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
            Hook options
          </p>
          {hookVariants.map((variant) => (
            <button
              key={`${variant.text}-${variant.angle}`}
              type="button"
              className="rounded-lg border border-border bg-white p-3 text-left transition-colors hover:border-accent"
              onClick={() => onApplyHookVariant(variant.text)}
            >
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block break-words text-sm font-bold text-text-primary">
                    {variant.text}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-accent-dark">
                    {variant.angle}
                  </span>
                </span>
                <Check
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary"
                />
              </span>
              {variant.reason ? (
                <span className="mt-2 block text-xs leading-5 text-text-secondary">
                  {variant.reason}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm font-semibold text-accent-dark">
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
