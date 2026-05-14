"use client";

import { Settings } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ProductDemoUploadControlsProps = {
  products: ProductProfile[];
  isLoading: boolean;
  selectedProductId: string;
  onSelectedProductIdChange: (id: string) => void;
};

export function ProductDemoUploadControls({
  products,
  isLoading,
  selectedProductId,
  onSelectedProductIdChange,
}: ProductDemoUploadControlsProps) {
  if (isLoading && !products.length) {
    return (
      <div className="rounded-lg border border-border bg-surface-elevated p-3">
        <p className="text-sm font-semibold text-text-primary">
          Loading products
        </p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Product required
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Create a product before uploading demos.
          </p>
        </div>
        <SecondaryButtonLink
          href="/dashboard/settings"
          icon={<Settings aria-hidden className="h-4 w-4" />}
        >
          Add product
        </SecondaryButtonLink>
      </div>
    );
  }

  return (
    <SelectInput
      label="Product"
      disabled={isLoading}
      options={products.map((product) => ({
        label: product.name,
        value: product.id,
      }))}
      value={selectedProductId}
      onChange={(event) =>
        onSelectedProductIdChange(event.currentTarget.value)
      }
    />
  );
}
