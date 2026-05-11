"use client";

import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { ProductSettingsForm } from "@/app/_components/settings/ProductSettingsForm";
import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";

export function SettingsPageClient() {
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
        {products.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {products.error}
          </div>
        ) : null}
        <ProductSettingsForm
          isSaving={products.isSaving}
          onCreate={products.createProduct}
        />
        <ProductSettingsList products={products.products} />
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsSupportPanel />
          <SettingsSubscriptionPanel />
        </div>
      </div>
    </DashboardShell>
  );
}
