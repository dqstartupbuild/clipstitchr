"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ProductFilterSelectProps = {
  products: ProductProfile[];
  label: string;
  value: string;
  allLabel?: string;
  onChange: (value: string) => void;
};

export function ProductFilterSelect({
  products,
  label,
  value,
  allLabel = "All products",
  onChange,
}: ProductFilterSelectProps) {
  const options = [
    { label: allLabel, value: "all" },
    ...products.map((product) => ({
      label: product.name,
      value: product.id,
    })),
  ];

  return (
    <SelectInput
      label={label}
      options={options}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}
