import { Boxes } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CliprProductPanelProps = {
  products: ProductProfile[];
  selectedProductId: string;
  onChange: (productId: string) => void;
};

export function CliprProductPanel({
  products,
  selectedProductId,
  onChange,
}: CliprProductPanelProps) {
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
      <SelectInput
        label="Product"
        value={selectedProductId}
        options={products.map((product) => ({
          label: product.name,
          value: product.id,
        }))}
        disabled={!products.length}
        onChange={(event) => onChange(event.target.value)}
      />
      {!products.length ? (
        <p className="mt-3 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          Save a product in Settings before generating a Clip.
        </p>
      ) : null}
    </section>
  );
}
