import { Search } from "lucide-react";
import type { HookLibraryCategoryOption } from "@/lib/clipstitchr/types/HookLibraryCategoryOption";
import type { HookLibraryFilterState } from "@/lib/clipstitchr/types/HookLibraryFilterState";

export function HookLibraryFilters({
  categories,
  filters,
  triggers,
  onChange,
}: {
  categories: HookLibraryCategoryOption[];
  filters: HookLibraryFilterState;
  triggers: string[];
  onChange: (filters: HookLibraryFilterState) => void;
}) {
  const controlClassName =
    "min-h-11 w-full rounded-md bg-background px-3 text-sm text-text-primary outline-none ring-1 ring-inset ring-border focus:ring-2 focus:ring-border-hover";

  return (
    <div className="grid gap-4 rounded-lg bg-surface p-4 sm:p-5">
      <label className="relative block">
        <span className="sr-only">Search hook templates</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
        />
        <input
          className={`${controlClassName} pl-10`}
          placeholder="Search words, outcomes, or use cases"
          type="search"
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.currentTarget.value })
          }
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-semibold text-text-secondary">
          Category
          <select
            className={controlClassName}
            value={filters.category}
            onChange={(event) =>
              onChange({ ...filters, category: event.currentTarget.value })
            }
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-text-secondary">
          Feeling
          <select
            className={controlClassName}
            value={filters.trigger}
            onChange={(event) =>
              onChange({ ...filters, trigger: event.currentTarget.value })
            }
          >
            <option value="">Any feeling</option>
            {triggers.map((trigger) => (
              <option key={trigger} value={trigger}>
                {trigger}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-text-secondary">
          Best place to use it
          <select
            className={controlClassName}
            value={filters.purpose}
            onChange={(event) =>
              onChange({
                ...filters,
                purpose: event.currentTarget
                  .value as HookLibraryFilterState["purpose"],
              })
            }
          >
            <option value="">Any tool</option>
            <option value="clipr">Clipr</option>
            <option value="stitchr">Stitchr</option>
            <option value="swipr">Swipr</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-text-secondary">
          Intensity
          <select
            className={controlClassName}
            value={filters.risk}
            onChange={(event) =>
              onChange({
                ...filters,
                risk: event.currentTarget
                  .value as HookLibraryFilterState["risk"],
              })
            }
          >
            <option value="">Any intensity</option>
            <option value="safe">Easygoing</option>
            <option value="medium">Punchy</option>
            <option value="aggressive">Bold</option>
          </select>
        </label>
      </div>
    </div>
  );
}
