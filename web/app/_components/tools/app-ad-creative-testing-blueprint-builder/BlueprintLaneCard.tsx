import { BlueprintCellCard } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintCellCard";
import type { BlueprintCell } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCell";
import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";

type BlueprintLaneCardProps = {
  cells: BlueprintCell[];
  lane: BlueprintLane;
  number: number;
};

export function BlueprintLaneCard({
  cells,
  lane,
  number,
}: BlueprintLaneCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface-elevated p-5">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Lane {number}
      </p>
      <h3 className="mt-2 text-lg font-bold text-text-primary">{lane.title}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-text-primary">
        {lane.learningQuestion}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {lane.hypothesis}
      </p>
      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase text-text-tertiary">
          Keep fixed
        </p>
        <ul className="mt-2 grid gap-1 text-xs leading-5 text-text-secondary">
          {lane.fixedControls.map((control) => (
            <li key={control}>• {control}</li>
          ))}
        </ul>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {cells.map((cell) => (
          <BlueprintCellCard cell={cell} key={cell.id} />
        ))}
      </ul>
      <div className="mt-4 grid gap-2 text-xs leading-5 text-text-secondary sm:grid-cols-2">
        <p>
          <strong className="text-text-primary">Leading signal:</strong>{" "}
          {lane.leadingSignal}
        </p>
        <p>
          <strong className="text-text-primary">Next learning action:</strong>{" "}
          {lane.nextLearningAction}
        </p>
      </div>
    </article>
  );
}
