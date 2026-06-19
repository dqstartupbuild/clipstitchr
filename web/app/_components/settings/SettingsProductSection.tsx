import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsAutomationPanel } from "@/app/_components/settings/SettingsAutomationPanel";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
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
  products: ProductProfile[];
  savingProductId: string | null;
  swiprPacks: SwiprLibraryPack[];
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveAutomation: (
    preferences: AutomationPreferencesInput,
  ) => Promise<void>;
  onSetActiveProduct: (product: ProductProfile) => Promise<void>;
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
  products,
  savingProductId,
  swiprPacks,
  onDeleteProduct,
  onSaveAutomation,
  onSetActiveProduct,
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
        products={products}
        savingProductId={savingProductId}
        onDelete={onDeleteProduct}
        onSetDefault={onSetActiveProduct}
        onUpdate={onUpdateProduct}
      />
      <SettingsAutomationPanel
        error={automationError}
        isLoading={isAutomationLoading}
        isSaving={isAutomationSaving}
        preferences={automationPreferences}
        productName={activeProductName}
        swiprPacks={swiprPacks}
        onSave={onSaveAutomation}
      />
    </section>
  );
}
