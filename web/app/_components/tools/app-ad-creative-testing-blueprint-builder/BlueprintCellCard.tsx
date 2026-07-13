import type { BlueprintCell } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCell";

type BlueprintCellCardProps = {
  cell: BlueprintCell;
};

export function BlueprintCellCard({ cell }: BlueprintCellCardProps) {
  return (
    <li
      className={
        cell.status === "active"
          ? "rounded-lg border border-accent/30 bg-accent/5 p-4"
          : "rounded-lg border border-border bg-surface-muted/40 p-4 opacity-80"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase text-text-tertiary">
          {cell.label}
        </span>
        <span className="rounded-full border border-border bg-surface px-2 py-1 text-[11px] font-bold uppercase text-text-secondary">
          {cell.status}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold leading-6 text-text-primary">
        {cell.direction}
      </p>
      <p className="mt-2 text-xs leading-5 text-text-tertiary">
        Change only: {cell.changedVariable}
      </p>
    </li>
  );
}
