"use client";

import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { ProductSettingsForm } from "@/app/_components/settings/ProductSettingsForm";
import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsAppearancePanel } from "@/app/_components/settings/SettingsAppearancePanel";
import { SettingsAutomationPanel } from "@/app/_components/settings/SettingsAutomationPanel";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import { useAutomationPreferences } from "@/lib/clipstitchr/hooks/useAutomationPreferences";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";

export function SettingsPageClient() {
  const automation = useAutomationPreferences();
  const products = useProducts();

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Save product context for Swipr and future workspace controls."
          actions={null}
        />
        <SettingsAppearancePanel />
        <SettingsAutomationPanel
          error={automation.error}
          isLoading={automation.isLoading}
          isSaving={automation.isSaving}
          preferences={automation.preferences}
          onSave={automation.savePreferences}
        />
        {products.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {products.error}
          </div>
        ) : null}
        <ProductSettingsForm
          isSaving={products.isCreating}
          onCreate={products.createProduct}
        />
        <ProductSettingsList
          products={products.products}
          defaultProductId={products.defaultProductId}
          defaultingProductId={products.defaultingProductId}
          deletingProductId={products.deletingProductId}
          isActionDisabled={
            products.isSaving || products.deletingProductId !== null
          }
          savingProductId={products.savingProductId}
          onDelete={products.deleteProduct}
          onSetDefault={products.setDefaultProduct}
          onUpdate={products.updateProduct}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsSupportPanel />
          <SettingsSubscriptionPanel />
        </div>
      </div>
    </DashboardShell>
  );
}
