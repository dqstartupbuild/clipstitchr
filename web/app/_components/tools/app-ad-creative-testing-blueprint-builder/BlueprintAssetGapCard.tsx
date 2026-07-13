import type { BlueprintAssetGap } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetGap";

type BlueprintAssetGapCardProps = {
  gap: BlueprintAssetGap;
};

export function BlueprintAssetGapCard({ gap }: BlueprintAssetGapCardProps) {
  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-text-primary">{gap.label}</span>
        <span
          className={
            gap.gap > 0
              ? "text-sm font-bold text-amber-700"
              : "text-sm font-bold text-emerald-700"
          }
        >
          {gap.gap > 0 ? `${gap.gap} missing` : "Ready"}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-text-tertiary">
        {gap.available} available · {gap.required} required
      </p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">
        {gap.guidance}
      </p>
    </li>
  );
}
