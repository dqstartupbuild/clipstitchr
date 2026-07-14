"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CreativeTestingTrackerExports } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingTrackerExports";
import { CreativeTestingTrackerTable } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingTrackerTable";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import { createCreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingExperiment";
import { defaultCreativeTestingExperiments } from "@/lib/clipstitchr/tools/creativeTestingTracker/defaultCreativeTestingExperiments";

type CreativeTestingTrackerWorkspaceProps = {
  hasFunctionalUnlock?: boolean;
  variant?: PublicToolGateVariant;
};

export function CreativeTestingTrackerWorkspace({
  hasFunctionalUnlock = false,
  variant = "control",
}: CreativeTestingTrackerWorkspaceProps) {
  const [experiments, setExperiments] = useState<CreativeTestingExperiment[]>(
    defaultCreativeTestingExperiments,
  );
  const [nextIndex, setNextIndex] = useState(3);

  return (
    <section className="px-6 py-16" aria-label="Creative testing tracker">
      <Panel className="mx-auto max-w-[1500px] p-5 md:p-6">
        <PanelHeader
          eyebrow="Browser-local tracker"
          title="Track the creative, then read only the metrics your row supports"
          description="Rows stay in this session. Empty denominators stay unavailable instead of turning into misleading zeroes."
          actions={
            <CreativeTestingTrackerExports
              experiments={experiments}
              hasFunctionalUnlock={hasFunctionalUnlock}
              variant={variant}
            />
          }
        />
        <CreativeTestingTrackerTable
          experiments={experiments}
          onChange={(nextExperiment) =>
            setExperiments((current) =>
              current.map((experiment) =>
                experiment.id === nextExperiment.id
                  ? nextExperiment
                  : experiment,
              ),
            )
          }
          onRemove={(id) =>
            setExperiments((current) =>
              current.length > 1
                ? current.filter((experiment) => experiment.id !== id)
                : current,
            )
          }
        />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
            disabled={experiments.length >= 12}
            onClick={() => {
              setExperiments((current) => [
                ...current,
                createCreativeTestingExperiment(nextIndex),
              ]);
              setNextIndex((current) => current + 1);
            }}
            type="button"
          >
            <Plus aria-hidden className="h-4 w-4" />
            Add experiment
          </button>
          <p className="text-xs leading-5 text-text-tertiary">
            CTR = clicks ÷ impressions. Install rate = installs ÷ clicks. CPI =
            spend ÷ installs. CPA = spend ÷ conversions.
          </p>
        </div>
      </Panel>
    </section>
  );
}
