"use client";

import { HookPlanCard } from "@/app/_components/hooks/HookPlanCard";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { hookHistoryPageSize } from "@/lib/clipstitchr/constants/hookHistoryPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";

type HookLabPaginatedHistoryGridProps = {
  plans: StitchrHookPlan[];
  savingPlanId: string | null;
  onAccept: (id: string, hookText?: string) => Promise<void>;
  onReject: (id: string, hookText?: string) => Promise<void>;
  onSelectOption: (id: string, hookText: string) => Promise<void>;
};

export function HookLabPaginatedHistoryGrid({
  plans,
  savingPlanId,
  onAccept,
  onReject,
  onSelectOption,
}: HookLabPaginatedHistoryGridProps) {
  const pagination = usePagination(plans, {
    pageSize: hookHistoryPageSize,
  });

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pagination.pageItems.map((plan) => (
          <HookPlanCard
            key={plan.id}
            plan={plan}
            isSaving={savingPlanId === plan.id}
            onAccept={onAccept}
            onReject={onReject}
            onSelectOption={onSelectOption}
          />
        ))}
      </div>
      {pagination.totalPages > 1 ? (
        <PaginationControls
          canGoNext={pagination.canGoNext}
          canGoPrevious={pagination.canGoPrevious}
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          visibleEnd={pagination.visibleEnd}
          visibleStart={pagination.visibleStart}
          onNext={pagination.goToNextPage}
          onPrevious={pagination.goToPreviousPage}
        />
      ) : null}
    </div>
  );
}
