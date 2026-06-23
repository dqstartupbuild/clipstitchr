"use client";

import { useMemo } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SettingsAccountSection } from "@/app/_components/settings/SettingsAccountSection";
import { SettingsProductSection } from "@/app/_components/settings/SettingsProductSection";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useAutomationPreferences } from "@/lib/clipstitchr/hooks/useAutomationPreferences";
import { useStitchTemplates } from "@/lib/clipstitchr/hooks/useStitchTemplates";
import { useSwiprLibrary } from "@/lib/clipstitchr/hooks/useSwiprLibrary";
import { getSwiprLibraryPacks } from "@/lib/clipstitchr/utils/getSwiprLibraryPacks";

export function SettingsPageClient() {
  const products = useDashboardProduct();
  const stitchTemplates = useStitchTemplates();
  const swiprLibrary = useSwiprLibrary();
  const automation = useAutomationPreferences(products.activeProduct?.id);
  const swiprPacks = useMemo(
    () => getSwiprLibraryPacks(swiprLibrary.backgrounds),
    [swiprLibrary.backgrounds],
  );

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Edit product details, automation, and account preferences."
          actions={null}
        />
        <SettingsProductSection
          activeProductId={products.defaultProductId}
          activeProduct={products.activeProduct}
          activeProductName={products.activeProduct?.name}
          automationError={automation.error}
          automationPreferences={automation.preferences}
          defaultingProductId={products.defaultingProductId}
          deletingProductId={products.deletingProductId}
          isAutomationLoading={automation.isLoading || stitchTemplates.isLoading}
          isAutomationSaving={automation.isSaving}
          isProductActionDisabled={products.isSaving}
          products={products.products}
          savingProductId={products.savingProductId}
          stitchTemplates={stitchTemplates.templates}
          swiprPacks={swiprPacks}
          onDeleteProduct={products.deleteProduct}
          onSaveAutomation={automation.savePreferences}
          onSetActiveProduct={products.setActiveProduct}
          onUpdateProduct={products.updateProduct}
        />
        <SettingsAccountSection />
      </div>
    </DashboardShell>
  );
}
