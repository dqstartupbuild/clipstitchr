import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { getIsSwiprPackSelected } from "@/lib/clipstitchr/utils/getIsSwiprPackSelected";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

type AutomationSwiprPackPickerProps = {
  disabled: boolean;
  packs: SwiprLibraryPack[];
  selectedPackNames: string[];
  onChange: (selectedPackNames: string[]) => void;
};

export function AutomationSwiprPackPicker({
  disabled,
  packs,
  selectedPackNames,
  onChange,
}: AutomationSwiprPackPickerProps) {
  const handleToggle = (packName: string) => {
    const isSelected = getIsSwiprPackSelected(packName, selectedPackNames);

    onChange(
      isSelected
        ? selectedPackNames.filter(
            (selectedPackName) =>
              normalizeSwiprLibraryQueryKey(selectedPackName) !==
              normalizeSwiprLibraryQueryKey(packName),
          )
        : [...selectedPackNames, packName],
    );
  };

  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold text-text-primary">Swipr packs</p>
      {packs.length ? (
        <div className="flex min-w-0 flex-wrap gap-2">
          {packs.map((pack) => {
            const isSelected = getIsSwiprPackSelected(
              pack.name,
              selectedPackNames,
            );

            return (
              <button
                key={normalizeSwiprLibraryQueryKey(pack.name)}
                type="button"
                aria-pressed={isSelected}
                className={[
                  "inline-flex min-h-10 items-center rounded-lg border px-3 py-1.5 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-accent bg-surface-muted text-accent-dark"
                    : "border-border bg-white text-text-secondary hover:border-accent",
                ].join(" ")}
                disabled={disabled}
                onClick={() => handleToggle(pack.name)}
              >
                {pack.name} ({pack.count})
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-text-secondary">
          Save a Pexels pack in Swipr to choose it here.
        </p>
      )}
    </div>
  );
}
