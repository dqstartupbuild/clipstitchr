import type { ProductDemoUse } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoUse";
import { productDemoUseOptions } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoUseOptions";

type ProductDemoUseFieldProps = {
  onChange: (value: ProductDemoUse) => void;
  value: ProductDemoUse;
};

export function ProductDemoUseField({
  onChange,
  value,
}: ProductDemoUseFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-text-primary">
      Where will this demo run first?
      <select
        className="h-12 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as ProductDemoUse)}
      >
        {productDemoUseOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} — {option.description}
          </option>
        ))}
      </select>
      <span className="font-normal leading-6 text-text-tertiary">
        This only changes the planning-length guideline. It is not a platform
        rule.
      </span>
    </label>
  );
}
