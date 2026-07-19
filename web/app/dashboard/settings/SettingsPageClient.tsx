"use client";

import { useMemo } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SettingsAccountSection } from "@/app/_components/settings/SettingsAccountSection";
import { SettingsProductSection } from "@/app/_components/settings/SettingsProductSection";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useAutomationPreferences } from "@/lib/clipstitchr/hooks/useAutomationPreferences";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import { getAccountSwiprLibraryPacks } from "@/lib/clipstitchr/utils/getAccountSwiprLibraryPacks";

export function SettingsPageClient() {
  const products = useDashboardProduct();
  const swiprLibrary = useSwiprLibrary();
  const automation = useAutomationPreferences(products.activeProduct?.id);
  const swiprPacks = useMemo(
    () => getAccountSwiprLibraryPacks(swiprLibrary.globalPexelsPacks),
    [swiprLibrary.globalPexelsPacks],
  );

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Product setup"
          title="Settings"
          description="Manage product details, posting preferences, and workspace defaults."
          actions={null}
        />
        <SettingsProductSection
          activeProductId={products.defaultProductId}
          activeProductName={products.activeProduct?.name}
          archivedProducts={products.archivedProducts}
          automationError={automation.error}
          automationPreferences={automation.preferences}
          defaultingProductId={products.defaultingProductId}
          deletingProductId={products.deletingProductId}
          isAutomationLoading={automation.isLoading}
          isAutomationSaving={automation.isSaving}
          isProductActionDisabled={products.isSaving}
          lockedProductIds={products.lockedProductIds}
          products={products.products}
          restoringProductId={products.restoringProductId}
          savingProductId={products.savingProductId}
          swiprPacks={swiprPacks}
          onDeleteProduct={products.deleteProduct}
          onSaveAutomation={automation.savePreferences}
          onRestoreProduct={products.restoreProduct}
          onSetActiveProduct={products.setActiveProduct}
          onShowProductPlanLimit={products.showProductPlanLimitDialog}
          onUpdateProduct={products.updateProduct}
        />
        <SettingsAccountSection
          isProductActionDisabled={products.isLoading || products.isSaving}
          products={products.products}
        />
      </div>
    </DashboardShell>
  );
}
