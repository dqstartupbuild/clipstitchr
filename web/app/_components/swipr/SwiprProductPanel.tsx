import { Boxes } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";

type SwiprProductOption = {
  value: string;
  label: string;
};

type SwiprProductPanelProps = {
  productOptions: SwiprProductOption[];
  selectedProductId: string;
  onProductChange: (productId: string) => void;
};

export function SwiprProductPanel({
  productOptions,
  selectedProductId,
  onProductChange,
}: SwiprProductPanelProps) {
  const hasProducts = productOptions.length > 0;

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Boxes aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Product</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Context
          </h2>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SelectInput
          label="Product"
          value={selectedProductId}
          options={productOptions}
          disabled={!hasProducts}
          onChange={(event) => onProductChange(event.target.value)}
        />
        {!hasProducts ? (
          <p className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
            Save a product in Settings before creating a Swipe.
          </p>
        ) : null}
      </div>
    </section>
  );
}
