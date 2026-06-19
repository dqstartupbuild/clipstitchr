"use client";

import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { getIsSwiprPackSelected } from "@/lib/clipstitchr/utils/getIsSwiprPackSelected";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

type SwiprLibraryPackPickerProps = {
  packs: SwiprLibraryPack[];
  selectedPackNames: string[];
  onEditPack?: (name: string) => void;
  onSelectedPackNamesChange: (names: string[]) => void;
};

export function SwiprLibraryPackPicker({
  packs,
  selectedPackNames,
  onEditPack,
  onSelectedPackNamesChange,
}: SwiprLibraryPackPickerProps) {
  const togglePack = (name: string) => {
    const isSelected = getIsSwiprPackSelected(name, selectedPackNames);

    onSelectedPackNamesChange(
      isSelected
        ? selectedPackNames.filter(
            (entry) =>
              normalizeSwiprLibraryQueryKey(entry) !==
              normalizeSwiprLibraryQueryKey(name),
          )
        : [...selectedPackNames, name],
    );
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-text-tertiary">
          {selectedPackNames.length
            ? `${selectedPackNames.length} of ${packs.length} packs selected`
            : "Choose the packs to use"}
        </p>
      </div>
      {packs.length ? (
        <div className="flex min-w-0 flex-wrap gap-2">
          {packs.map((pack) => {
            const isSelected = getIsSwiprPackSelected(
              pack.name,
              selectedPackNames,
            );

            return (
              <div
                key={normalizeSwiprLibraryQueryKey(pack.name)}
                className="inline-flex min-h-10 overflow-hidden rounded-lg border border-border bg-white"
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={[
                    "px-3 py-1.5 text-left text-sm font-semibold transition-colors",
                    isSelected
                      ? "bg-surface-muted text-accent-dark"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                  ].join(" ")}
                  onClick={() => togglePack(pack.name)}
                >
                  {pack.name} ({pack.count})
                </button>
                {onEditPack ? (
                  <button
                    type="button"
                    className="border-l border-border px-2 text-xs font-semibold text-text-tertiary transition-colors hover:bg-surface-muted hover:text-accent"
                    onClick={() => onEditPack(pack.name)}
                  >
                    Edit
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          Import Pexels photos to build reusable packs.
        </p>
      )}
    </div>
  );
}
