import { Panel } from "@/app/_components/ui/Panel";
import { ProductSettingsCard } from "@/app/_components/settings/ProductSettingsCard";
import { ArchivedProductList } from "@/app/_components/settings/ArchivedProductList";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import type { ProductLimitDialogReason } from "@/lib/clipstitchr/types/ProductLimitDialogReason";

type ProductSettingsListProps = {
  products: ProductProfile[];
  archivedProducts?: ProductProfile[];
  defaultProductId?: string;
  defaultingProductId: string | null;
  deletingProductId: string | null;
  isActionDisabled: boolean;
  lockedProductIds?: string[];
  savingProductId: string | null;
  restoringProductId?: string | null;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (product: ProductProfile) => Promise<void>;
  onShowProductPlanLimit?: (reason: ProductLimitDialogReason) => void;
  onRestore?: (id: string) => Promise<void>;
  onUpdate: (id: string, input: ProductProfileCreateInput) => Promise<unknown>;
};

export function ProductSettingsList({
  products,
  archivedProducts = [],
  defaultProductId,
  defaultingProductId,
  deletingProductId,
  isActionDisabled,
  lockedProductIds = [],
  savingProductId,
  restoringProductId = null,
  onDelete,
  onSetDefault,
  onShowProductPlanLimit = () => undefined,
  onRestore = async () => undefined,
  onUpdate,
}: ProductSettingsListProps) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Products</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Edit saved products
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
              isLocked={lockedProductIds.includes(product.id)}
              isSaving={savingProductId === product.id}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
              onShowProductPlanLimit={onShowProductPlanLimit}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Use the product switcher in the sidebar to add one, then edit it here.
        </p>
      )}
      <ArchivedProductList
        isActionDisabled={isActionDisabled}
        products={archivedProducts}
        restoringProductId={restoringProductId}
        onRestore={onRestore}
      />
    </Panel>
  );
}
