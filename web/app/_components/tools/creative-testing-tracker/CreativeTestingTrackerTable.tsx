import { CreativeTestingExperimentRow } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingExperimentRow";
import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";

type CreativeTestingTrackerTableProps = {
  experiments: readonly CreativeTestingExperiment[];
  onChange: (experiment: CreativeTestingExperiment) => void;
  onRemove: (id: string) => void;
};

const headings = [
  "Channel",
  "Hook",
  "Visual",
  "CTA",
  "Spend",
  "Impressions",
  "Clicks",
  "Installs",
  "Conversions",
  "CTR",
  "Install rate",
  "CPI",
  "CPA",
  "Remove",
];

export function CreativeTestingTrackerTable({
  experiments,
  onChange,
  onRemove,
}: CreativeTestingTrackerTableProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left">
        <thead className="bg-surface-elevated">
          <tr>
            {headings.map((heading) => (
              <th
                className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase text-text-secondary"
                key={heading}
                scope="col"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {experiments.map((experiment) => (
            <CreativeTestingExperimentRow
              canRemove={experiments.length > 1}
              experiment={experiment}
              key={experiment.id}
              onChange={onChange}
              onRemove={() => onRemove(experiment.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
