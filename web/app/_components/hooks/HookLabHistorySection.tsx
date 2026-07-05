"use client";

import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { HookLabPaginatedHistoryGrid } from "@/app/_components/hooks/HookLabPaginatedHistoryGrid";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import { filterStitchrHookPlansByProductId } from "@/lib/clipstitchr/utils/filterStitchrHookPlansByProductId";
import { filterStitchrHookPlansBySearchQuery } from "@/lib/clipstitchr/utils/filterStitchrHookPlansBySearchQuery";

type HookLabHistorySectionProps = {
  error: string | null;
  isLoading: boolean;
  productFilterId: string;
  products: ProductProfile[];
  savingPlanId: string | null;
  searchQuery: string;
  plans: StitchrHookPlan[];
  onAccept: (id: string, hookText?: string) => Promise<void>;
  onProductFilterChange: (productId: string) => void;
  onReject: (id: string, hookText?: string) => Promise<void>;
  onSelectOption: (id: string, hookText: string) => Promise<void>;
};

export function HookLabHistorySection({
  error,
  isLoading,
  productFilterId,
  products,
  savingPlanId,
  searchQuery,
  plans,
  onAccept,
  onProductFilterChange,
  onReject,
  onSelectOption,
}: HookLabHistorySectionProps) {
  const visiblePlans = filterStitchrHookPlansBySearchQuery(
    filterStitchrHookPlansByProductId(plans, productFilterId),
    searchQuery,
  );
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
        <div className="grid gap-2">
          <h2 className="text-2xl font-bold text-text-primary">Hook history</h2>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary">
            Review the hooks ClipStitchr made, keep the ones you like, and block
            the ones that feel wrong.
          </p>
        </div>
        <SelectInput
          label="Product"
          value={productFilterId}
          options={[
            { label: "All products", value: "" },
            ...products.map((product) => ({
              label: product.name,
              value: product.id,
            })),
          ]}
          onChange={(event) => onProductFilterChange(event.currentTarget.value)}
        />
      </div>
      {error ? (
        <DashboardAlert variant="error">{error}</DashboardAlert>
      ) : null}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-surface p-5 text-sm text-text-secondary">
          Loading hooks...
        </div>
      ) : visiblePlans.length ? (
        <HookLabPaginatedHistoryGrid
          key={`${productFilterId}:${searchQuery.trim().toLowerCase()}`}
          plans={visiblePlans}
          savingPlanId={savingPlanId}
          onAccept={onAccept}
          onReject={onReject}
          onSelectOption={onSelectOption}
        />
      ) : (
        <DashboardEmptyState
          title={hasSearchQuery ? "No matching hooks" : "No hooks yet"}
          description={
            hasSearchQuery
              ? "No saved hooks match that search."
              : "Run a Stitchr batch to see hook options here."
          }
        />
      )}
    </div>
  );
}
