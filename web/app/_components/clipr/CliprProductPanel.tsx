import { Boxes } from "lucide-react";
import Link from "next/link";
import { SelectInput } from "@/app/_components/ui/SelectInput";

type CliprProductOption = {
  value: string;
  label: string;
};

type CliprProductPanelProps = {
  productOptions: CliprProductOption[];
  selectedProductId: string;
  onProductChange: (productId: string) => void;
};

export function CliprProductPanel({
  productOptions,
  selectedProductId,
  onProductChange,
}: CliprProductPanelProps) {
  const hasProducts = productOptions.length > 0;

  return (
    <section>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Boxes aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Product</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Pick the context
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Product settings guide the hook and script.
          </p>
        </div>
      </div>
      <div className="mt-3">
        <SelectInput
          label="Product"
          value={selectedProductId}
          options={productOptions}
          disabled={!hasProducts}
          onChange={(event) => onProductChange(event.target.value)}
        />
        {!hasProducts ? (
          <div className="mt-3 rounded-lg border border-border bg-surface-elevated p-4">
            <h3 className="text-sm font-bold text-text-primary">
              No saved products yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Save a product before creating a Clipr clip.
            </p>
            <Link href="/dashboard/settings" className="btn-secondary mt-4">
              Open Settings
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
