"use client";

import { SearchInput } from "@/app/_components/ui/SearchInput";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { HookLabIdeaCapabilityFilter } from "@/lib/clipstitchr/types/HookLabIdeaCapabilityFilter";
import type { HookLabIdeaScopeFilter } from "@/lib/clipstitchr/types/HookLabIdeaScopeFilter";
import type { HookLabIdeaStatusFilter } from "@/lib/clipstitchr/types/HookLabIdeaStatusFilter";

type HookLabIdeaFiltersProps = {
  capabilityFilter: HookLabIdeaCapabilityFilter;
  scopeFilter: HookLabIdeaScopeFilter;
  searchQuery: string;
  statusFilter: HookLabIdeaStatusFilter;
  onCapabilityFilterChange: (filter: HookLabIdeaCapabilityFilter) => void;
  onScopeFilterChange: (filter: HookLabIdeaScopeFilter) => void;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: HookLabIdeaStatusFilter) => void;
};

export function HookLabIdeaFilters({
  capabilityFilter,
  scopeFilter,
  searchQuery,
  statusFilter,
  onCapabilityFilterChange,
  onScopeFilterChange,
  onSearchQueryChange,
  onStatusFilterChange,
}: HookLabIdeaFiltersProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_190px_190px] xl:items-end">
      <SearchInput
        label="Search ideas"
        value={searchQuery}
        placeholder="Search ideas"
        onChange={onSearchQueryChange}
      />
      <SelectInput
        label="Ideas to show"
        value={scopeFilter}
        options={[
          { label: "Shared + active product", value: "current" },
          { label: "All ideas", value: "all" },
          { label: "Shared only", value: "shared" },
          { label: "Active product only", value: "product" },
        ]}
        onChange={(event) =>
          onScopeFilterChange(
            event.currentTarget.value as HookLabIdeaScopeFilter,
          )
        }
      />
      <SelectInput
        label="Status"
        value={statusFilter}
        options={[
          { label: "Any status", value: "all" },
          { label: "Ready", value: "ready" },
          { label: "Analyzing", value: "analyzing" },
          { label: "Generating", value: "generating" },
          { label: "Needs attention", value: "needs_attention" },
          { label: "Failed", value: "failed" },
          { label: "Archived", value: "archived" },
        ]}
        onChange={(event) =>
          onStatusFilterChange(
            event.currentTarget.value as HookLabIdeaStatusFilter,
          )
        }
      />
      <SelectInput
        label="Includes"
        value={capabilityFilter}
        options={[
          { label: "Anything reusable", value: "all" },
          { label: "Text pattern", value: "text" },
          { label: "Creative beat", value: "creative_beat" },
          { label: "Saved setup", value: "saved_setup" },
        ]}
        onChange={(event) =>
          onCapabilityFilterChange(
            event.currentTarget.value as HookLabIdeaCapabilityFilter,
          )
        }
      />
    </div>
  );
}
