import { Panel } from "@/app/_components/ui/Panel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ProductSettingsListProps = {
  products: ProductProfile[];
};

export function ProductSettingsList({ products }: ProductSettingsListProps) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Saved products
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Swipr sources
          </h2>
        </div>
        <span className="text-sm font-semibold text-text-tertiary">
          {products.length}
        </span>
      </div>
      {products.length ? (
        <div className="mt-4 flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-border bg-surface-elevated p-3"
            >
              <p className="truncate text-sm font-bold text-text-primary">
                {product.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">
                {product.productDetails || product.audienceDetails || "Saved"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Saved products will appear in Swipr as carousel background context.
        </p>
      )}
    </Panel>
  );
}
