"use client";

import { useDeferredValue, useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { Button } from "@/app/_components/ui/Button";
import { useHookLibraryTemplates } from "@/lib/clipstitchr/hooks/useHookLibraryTemplates";
import type { HookLibraryFilterState } from "@/lib/clipstitchr/types/HookLibraryFilterState";
import { HookLibraryFilters } from "./HookLibraryFilters";
import { HookLibraryGrid } from "./HookLibraryGrid";
import { HookLibraryPagination } from "./HookLibraryPagination";

const initialFilters: HookLibraryFilterState = {
  category: "",
  purpose: "",
  query: "",
  risk: "",
  trigger: "",
};

export function HookLibraryWorkspace() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(filters.query);
  const library = useHookLibraryTemplates({
    category: filters.category || undefined,
    page,
    purpose: filters.purpose || undefined,
    query: deferredQuery || undefined,
    risk: filters.risk || undefined,
    trigger: filters.trigger || undefined,
  });
  const data = library.data;

  return (
    <div
      aria-labelledby="hook-lab-library-tab"
      className="grid gap-6"
      role="tabpanel"
    >
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Find a stronger opening
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Browse {data?.totalItems.toLocaleString() ?? "1,000+"} reusable hook
          patterns. Search the words you need, or narrow the list by category,
          feeling, tool, and intensity.
        </p>
      </div>
      <HookLibraryFilters
        categories={data?.categories ?? []}
        filters={filters}
        triggers={data?.triggers ?? []}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
      />
      {library.error ? (
        <DashboardAlert variant="error">
          <span>{library.error}</span>
          <Button className="ml-3" size="sm" type="button" onClick={library.refetch}>
            Try again
          </Button>
        </DashboardAlert>
      ) : null}
      {data ? (
        <p aria-live="polite" className="text-sm text-text-tertiary">
          {data.totalItems.toLocaleString()} {data.totalItems === 1 ? "hook" : "hooks"}
          {data.totalItems ? ` · Page ${data.page} of ${data.totalPages}` : ""}
        </p>
      ) : null}
      <HookLibraryGrid
        isLoading={library.isLoading}
        items={data?.items ?? []}
      />
      {data ? (
        <HookLibraryPagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onChange={(nextPage) => {
            setPage(nextPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}
    </div>
  );
}
