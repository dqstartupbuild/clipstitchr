"use client";

import { Wand2 } from "lucide-react";
import { StitchrHookOptionSelector } from "@/app/_components/stitchr/StitchrHookOptionSelector";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

type StitchrAutoTextPanelProps = {
  hookPlanId?: string;
  hookVariants: StitchrHookVariant[];
  isGenerating: boolean;
  isSavingHookPlan: boolean;
  message: string | null;
  products: ProductProfile[];
  selectedHook: string;
  selectedProductId: string;
  onAcceptHookVariant: (hookText: string) => void;
  onApplyHookVariant: (text: string) => void;
  onGenerate: () => void;
  onProductChange: (productId: string) => void;
  onRejectHookVariant: (hookText: string) => void;
};

export function StitchrAutoTextPanel({
  hookPlanId,
  hookVariants,
  isGenerating,
  isSavingHookPlan,
  message,
  products,
  selectedHook,
  selectedProductId,
  onAcceptHookVariant,
  onApplyHookVariant,
  onGenerate,
  onProductChange,
  onRejectHookVariant,
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
        <StitchrHookOptionSelector
          hookPlanId={hookPlanId}
          hookVariants={hookVariants}
          isSaving={isSavingHookPlan}
          selectedHook={selectedHook}
          onAcceptHookVariant={onAcceptHookVariant}
          onRejectHookVariant={onRejectHookVariant}
          onSelectHookVariant={onApplyHookVariant}
        />
      ) : null}
      {message ? (
        <p className="mt-3 text-sm font-semibold text-accent-dark">
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
