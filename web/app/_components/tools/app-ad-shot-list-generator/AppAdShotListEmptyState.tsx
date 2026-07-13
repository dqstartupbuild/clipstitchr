import { Panel } from "@/app/_components/ui/Panel";

type AppAdShotListEmptyStateProps = {
  missingFields: string[];
};

export function AppAdShotListEmptyState({
  missingFields,
}: AppAdShotListEmptyStateProps) {
  return (
    <Panel className="p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Capture list paused
      </p>
      <h2 className="mt-2 text-2xl font-bold text-text-primary">
        Finish the missing details
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        Add {missingFields.join(", ")} so the list can give you complete
        directions instead of broken sentences.
      </p>
    </Panel>
  );
}
