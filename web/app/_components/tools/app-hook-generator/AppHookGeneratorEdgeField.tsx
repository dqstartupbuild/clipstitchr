import { appHookGeneratorEdgeLevelOptions } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorEdgeLevelOptions";
import type { AppHookGeneratorEdgeLevel } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorEdgeLevel";

type AppHookGeneratorEdgeFieldProps = {
  value: AppHookGeneratorEdgeLevel;
  onChange: (value: AppHookGeneratorEdgeLevel) => void;
};

export function AppHookGeneratorEdgeField({
  value,
  onChange,
}: AppHookGeneratorEdgeFieldProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-text-primary">
        How sharp should the hooks feel?
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {appHookGeneratorEdgeLevelOptions.map((option) => (
          <label
            className={[
              "cursor-pointer rounded-lg border p-3 transition-colors",
              value === option.value
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-accent/60",
            ].join(" ")}
            key={option.value}
          >
            <input
              checked={value === option.value}
              className="sr-only"
              name="app-hook-edge-level"
              type="radio"
              value={option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="block text-sm font-bold text-text-primary">
              {option.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-text-tertiary">
              {option.description}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
