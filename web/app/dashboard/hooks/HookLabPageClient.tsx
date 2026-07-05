"use client";

import { useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { HookLabHistorySection } from "@/app/_components/hooks/HookLabHistorySection";
import { HookLabMemoryPanel } from "@/app/_components/hooks/HookLabMemoryPanel";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useStitchrHookPlans } from "@/lib/clipstitchr/hooks/useStitchrHookPlans";

export function HookLabPageClient() {
  const products = useDashboardProduct();
  const hookPlans = useStitchrHookPlans();
  const [productFilterId, setProductFilterId] = useState(
    products.activeProductId ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const error = products.error ?? hookPlans.error;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Writing"
          title="Hook Lab"
          description="Save the lines that sound like you and reuse them in new Stitches."
          actions={null}
        />
        {error ? (
          <DashboardAlert variant="error">{error}</DashboardAlert>
        ) : null}
        <HookLabMemoryPanel
          isSaving={products.isSaving}
          product={products.activeProduct}
          onUpdate={products.updateProduct}
        />
        <div className="flex justify-end">
          <SearchInput
            label="Search hooks"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search hooks"
            className="w-full sm:max-w-sm"
          />
        </div>
        <HookLabHistorySection
          error={hookPlans.error}
          isLoading={hookPlans.isLoading}
          plans={hookPlans.plans}
          productFilterId={productFilterId}
          products={products.products}
          savingPlanId={hookPlans.savingPlanId}
          searchQuery={searchQuery}
          onAccept={hookPlans.accept}
          onProductFilterChange={setProductFilterId}
          onReject={hookPlans.reject}
          onSelectOption={hookPlans.selectOption}
        />
      </div>
    </DashboardShell>
  );
}
