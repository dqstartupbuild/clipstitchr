import { Panel } from "@/app/_components/ui/Panel";

type BlueprintIncompleteStateProps = {
  missingFields: string[];
};

export function BlueprintIncompleteState({
  missingFields,
}: BlueprintIncompleteStateProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Blueprint needs context
      </p>
      <h2 className="mt-2 text-2xl font-bold text-text-primary">
        Finish the brief before using the plan.
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        Add the missing details so the tool does not create broken or generic
        hypotheses.
      </p>
      <ul className="mt-5 grid gap-2 text-sm font-semibold text-text-primary">
        {missingFields.map((field) => (
          <li
            className="rounded-lg border border-border bg-surface-muted/45 px-4 py-3"
            key={field}
          >
            Add: {field}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
