"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { StitchrHookOptions } from "@/app/_components/stitchr/StitchrHookOptions";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrHookOption } from "@/lib/clipstitchr/types/StitchrHookOption";

type StitchrAutoTextPanelProps = {
  isGenerating: boolean;
  hookOptions: StitchrHookOption[];
  message: string | null;
  products: ProductProfile[];
  selectedHookText: string;
  selectedProductId: string;
  onGenerate: () => void;
  onHookOptionSelect: (option: StitchrHookOption) => void;
  onProductChange: (productId: string) => void;
};

export function StitchrAutoTextPanel({
  hookOptions,
  isGenerating,
  message,
  products,
  selectedHookText,
  selectedProductId,
  onGenerate,
  onHookOptionSelect,
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
          Generate hooks
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-sm font-semibold text-accent-dark">
          {message}
        </p>
      ) : null}
      <StitchrHookOptions
        options={hookOptions}
        selectedText={selectedHookText}
        onSelect={onHookOptionSelect}
      />
    </Panel>
  );
}
