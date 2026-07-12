"use client";

import { Check, Film, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import type { HookLabStitchSource } from "@/lib/clipstitchr/types/HookLabStitchSource";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";

type HookLabIdeaStitchPickerProps = {
  isLoading: boolean;
  stitches: HookLabStitchSource[];
  onClose: () => void;
  onSelect: (stitch: HookLabStitchSource) => void;
};

export function HookLabIdeaStitchPicker({
  isLoading,
  stitches,
  onClose,
  onSelect,
}: HookLabIdeaStitchPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const visibleStitches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return query
      ? stitches.filter((stitch) =>
          [stitch.name, stitch.socialCaption]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(query)),
        )
      : stitches;
  }, [searchQuery, stitches]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div
        aria-labelledby="hook-lab-stitch-picker-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-sm font-semibold text-accent-dark">Past work</p>
            <h2
              id="hook-lab-stitch-picker-title"
              className="mt-1 text-balance text-xl font-bold text-text-primary"
            >
              Choose a Stitch
            </h2>
            <p className="mt-1 text-pretty text-sm text-text-secondary">
              Hook Lab will learn the useful setup without changing the original.
            </p>
          </div>
          <IconButton
            label="Close Stitch picker"
            icon={<X aria-hidden className="size-4" />}
            onClick={onClose}
          />
        </div>
        <div className="border-b border-border p-4">
          <SearchInput
            label="Search saved Stitches"
            value={searchQuery}
            placeholder="Search Stitches"
            onChange={setSearchQuery}
          />
        </div>
        <div className="min-h-0 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid gap-3" aria-label="Loading Stitches">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-20 rounded-lg border border-border bg-surface-muted"
                />
              ))}
            </div>
          ) : visibleStitches.length ? (
            <ul className="grid gap-3">
              {visibleStitches.map((stitch) => (
                <li key={stitch.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-white p-3 text-left transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    onClick={() => onSelect(stitch)}
                  >
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-accent-dark">
                      <Film aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-text-primary">
                        {stitch.name}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-text-tertiary">
                        Saved {formatDate(stitch.createdAt)}
                      </span>
                    </span>
                    <Check aria-hidden className="size-4 text-accent" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-border bg-surface-muted p-5 text-center">
              <p className="text-sm font-bold text-text-primary">
                {searchQuery ? "No matching Stitches" : "No saved Stitches yet"}
              </p>
              <p className="mt-1 text-pretty text-sm text-text-secondary">
                {searchQuery
                  ? "Try a different name."
                  : "Finish a Stitch first, then bring its setup back here."}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-border p-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
