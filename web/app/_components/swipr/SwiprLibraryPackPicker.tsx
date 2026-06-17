"use client";

import { SwiprLibraryPackButton } from "@/app/_components/swipr/SwiprLibraryPackButton";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

type SwiprLibraryPackPickerProps = {
  packs: SwiprLibraryPack[];
  selectedPackNames: string[];
  onEditPack?: (name: string) => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onSelectedPackNamesChange: (names: string[]) => void;
};

export function SwiprLibraryPackPicker({
  packs,
  selectedPackNames,
  onEditPack,
  onLoadBackgroundBlob,
  onSelectedPackNamesChange,
}: SwiprLibraryPackPickerProps) {
  const packNames = packs.map((pack) => pack.name);

  const togglePack = (name: string) => {
    onSelectedPackNamesChange(
      selectedPackNames.includes(name)
        ? selectedPackNames.filter((entry) => entry !== name)
        : [...selectedPackNames, name],
    );
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-text-tertiary">
          {selectedPackNames.length
            ? `${selectedPackNames.length} of ${packs.length} packs selected`
            : "All saved Pexels packs"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-xs font-semibold text-text-secondary hover:text-accent"
            onClick={() => onSelectedPackNamesChange(packNames)}
          >
            All
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-text-secondary hover:text-accent"
            onClick={() => onSelectedPackNamesChange([])}
          >
            Any
          </button>
        </div>
      </div>
      {packs.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {packs.map((pack) => (
            <SwiprLibraryPackButton
              key={pack.name}
              isSelected={selectedPackNames.includes(pack.name)}
              pack={pack}
              onEdit={onEditPack}
              onLoadBackgroundBlob={onLoadBackgroundBlob}
              onToggle={togglePack}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          Import Pexels photos to build reusable packs.
        </p>
      )}
    </div>
  );
}
