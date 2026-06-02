import { Panel } from "@/app/_components/ui/Panel";
import { ProductSettingsCard } from "@/app/_components/settings/ProductSettingsCard";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type ProductSettingsListProps = {
  products: ProductProfile[];
  defaultProductId?: string;
  defaultingProductId: string | null;
  deletingProductId: string | null;
  isActionDisabled: boolean;
  savingProductId: string | null;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (product: ProductProfile) => Promise<void>;
  onUpdate: (
    id: string,
    input: ProductProfileCreateInput,
  ) => Promise<unknown>;
};

export function ProductSettingsList({
  products,
  defaultProductId,
  defaultingProductId,
  deletingProductId,
  isActionDisabled,
  savingProductId,
  onDelete,
  onSetDefault,
  onUpdate,
}: ProductSettingsListProps) {
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
            <ProductSettingsCard
              key={product.id}
              product={product}
              isDefault={defaultProductId === product.id}
              isDefaulting={defaultingProductId === product.id}
              isDisabled={isActionDisabled}
              isDeleting={deletingProductId === product.id}
              isSaving={savingProductId === product.id}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
              onUpdate={onUpdate}
            />
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
