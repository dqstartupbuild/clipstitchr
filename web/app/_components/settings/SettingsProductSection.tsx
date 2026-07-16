import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsAutomationPanel } from "@/app/_components/settings/SettingsAutomationPanel";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import type { ProductLimitDialogReason } from "@/lib/clipstitchr/types/ProductLimitDialogReason";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

type SettingsProductSectionProps = {
  automationError: string | null;
  automationPreferences: AutomationPreferencesInput;
  activeProductId?: string;
  activeProductName?: string;
  defaultingProductId: string | null;
  deletingProductId: string | null;
  isAutomationLoading: boolean;
  isAutomationSaving: boolean;
  isProductActionDisabled: boolean;
  lockedProductIds?: string[];
  products: ProductProfile[];
  archivedProducts?: ProductProfile[];
  savingProductId: string | null;
  restoringProductId?: string | null;
  stitchTemplates: StitchTemplate[];
  swiprPacks: SwiprLibraryPack[];
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveAutomation: (preferences: AutomationPreferencesInput) => Promise<void>;
  onSetActiveProduct: (product: ProductProfile) => Promise<void>;
  onShowProductPlanLimit?: (reason: ProductLimitDialogReason) => void;
  onRestoreProduct?: (id: string) => Promise<void>;
  onUpdateProduct: (
    id: string,
    input: ProductProfileCreateInput,
  ) => Promise<unknown>;
};

export function SettingsProductSection({
  automationError,
  automationPreferences,
  activeProductId,
  activeProductName,
  defaultingProductId,
  deletingProductId,
  isAutomationLoading,
  isAutomationSaving,
  isProductActionDisabled,
  lockedProductIds = [],
  products,
  archivedProducts = [],
  savingProductId,
  restoringProductId = null,
  stitchTemplates,
  swiprPacks,
  onDeleteProduct,
  onSaveAutomation,
  onSetActiveProduct,
  onShowProductPlanLimit = () => undefined,
  onRestoreProduct = async () => undefined,
  onUpdateProduct,
}: SettingsProductSectionProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="product-settings">
      <div>
        <p className="text-sm font-semibold text-accent-dark">
          Product settings
        </p>
        <h2
          id="product-settings"
          className="mt-1 text-xl font-bold text-text-primary"
        >
          Active product
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Edit the product you are working on and choose what it should make
          each day.
        </p>
      </div>
      <ProductSettingsList
        defaultProductId={activeProductId}
        defaultingProductId={defaultingProductId}
        deletingProductId={deletingProductId}
        isActionDisabled={isProductActionDisabled}
        lockedProductIds={lockedProductIds}
        products={products}
        archivedProducts={archivedProducts}
        savingProductId={savingProductId}
        restoringProductId={restoringProductId}
        onDelete={onDeleteProduct}
        onSetDefault={onSetActiveProduct}
        onShowProductPlanLimit={onShowProductPlanLimit}
        onRestore={onRestoreProduct}
        onUpdate={onUpdateProduct}
      />
      <SettingsAutomationPanel
        error={automationError}
        isLoading={isAutomationLoading}
        isSaving={isAutomationSaving}
        preferences={automationPreferences}
        productName={activeProductName}
        stitchTemplates={stitchTemplates}
        swiprPacks={swiprPacks}
        onSave={onSaveAutomation}
      />
    </section>
  );
}
