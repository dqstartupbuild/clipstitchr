"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LibraryPageHeader } from "@/app/_components/dashboard/LibraryPageHeader";
import { StitchesSection } from "@/app/_components/dashboard/StitchesSection";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { filterStitchesByName } from "@/lib/clipstitchr/utils/filterStitchesByName";

export function StitchesPageClient() {
  const library = useClipLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const stitches = useMemo(
    () => filterStitchesByName(library.stitches, searchQuery),
    [library.stitches, searchQuery],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <LibraryPageHeader
          eyebrow="Exports"
          title="Stitches"
          description="Browse stitched UGC-first videos saved in this browser."
        />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        <div className="flex justify-end">
          <SearchInput
            label="Search stitches"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search stitches"
            className="w-full sm:max-w-sm"
          />
        </div>
        <StitchesSection
          stitches={stitches}
          emptyTitle={hasSearchQuery ? "No matching stitches" : undefined}
          emptyDescription={
            hasSearchQuery
              ? "No stitches match that name."
              : undefined
          }
          onDelete={library.removeStitch}
        />
      </div>
    </DashboardShell>
  );
}
