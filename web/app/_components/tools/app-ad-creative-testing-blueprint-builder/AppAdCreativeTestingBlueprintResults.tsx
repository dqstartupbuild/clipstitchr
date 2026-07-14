import { AppAdCreativeTestingBlueprintPricingCta } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintPricingCta";
import { PublicToolGateContentBoundary } from "@/app/_components/tools/gates/PublicToolGateContentBoundary";
import { BlueprintCellCard } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintCellCard";
import { BlueprintAssetGapCard } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintAssetGapCard";
import { BlueprintDecisionRubric } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintDecisionRubric";
import { BlueprintIncompleteState } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintIncompleteState";
import { BlueprintLaneCard } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintLaneCard";
import { BlueprintMeasurementContractCard } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/BlueprintMeasurementContractCard";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdCreativeTestingBlueprintBuild } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintBuild";
import { formatAppAdCreativeTestingBlueprintMarkdown } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/formatAppAdCreativeTestingBlueprintMarkdown";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppAdCreativeTestingBlueprintResultsProps = {
  build: AppAdCreativeTestingBlueprintBuild;
  variant?: PublicToolGateVariant;
};

export function AppAdCreativeTestingBlueprintResults({
  build,
  variant = "control",
}: AppAdCreativeTestingBlueprintResultsProps) {
  if (build.status === "incomplete") {
    return <BlueprintIncompleteState missingFields={build.missingFields} />;
  }

  const { result } = build;
  const firstExperiment = result.cells[0];

  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Blueprint updated with {result.activeCellCount} active cells and{" "}
        {result.backlogCellCount} backlog cells.
      </p>
      <div className="border-b border-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            Your testing blueprint
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            Learn one thing at a time, then earn the next test.
          </h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-elevated p-4">
          <p className="text-xs font-bold uppercase text-text-tertiary">
            Lanes
          </p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {result.lanes.length}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Personalized learning questions
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated p-4">
          <p className="text-xs font-bold uppercase text-text-tertiary">
            Active cells
          </p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {result.activeCellCount}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Fit the entered production and spend assumptions
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated p-4">
          <p className="text-xs font-bold uppercase text-text-tertiary">
            Backlog cells
          </p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {result.backlogCellCount}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Visible for a later comparison
          </p>
        </div>
      </div>
      {result.activeCellCount < 2 ? (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          A useful comparison needs at least two active cells. Increase the
          production capacity or revisit the visitor-entered spend floor.
        </p>
      ) : null}
      <section className="mt-6">
        <h3 className="text-sm font-bold text-text-primary">Testing lanes</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {result.lanes.map((lane) => (
            <li
              className="rounded-lg border border-border bg-surface-elevated p-4"
              key={lane.key}
            >
              <p className="font-bold text-text-primary">{lane.title}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {lane.learningQuestion}
              </p>
            </li>
          ))}
        </ul>
      </section>
      {firstExperiment ? (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-text-primary">
            First experiment
          </h3>
          <ul className="mt-3">
            <BlueprintCellCard cell={firstExperiment} />
          </ul>
        </section>
      ) : null}
      <PublicToolGateContentBoundary
        hasFunctionalUnlock
        toolKey="app-ad-creative-testing-blueprint-builder"
        variant={variant}
        publicContent={null}
        unlockedContent={<div className="mt-6 grid gap-6">
      <CopyTextButton
        className="justify-self-start"
        copiedLabel="Blueprint copied"
        label="Copy blueprint"
        text={formatAppAdCreativeTestingBlueprintMarkdown(result)}
      />
      <section className="mt-6">
        <h3 className="text-sm font-bold text-text-primary">
          Hypothesis lanes and one-variable cells
        </h3>
        <div className="mt-3 grid gap-4">
          {result.lanes.map((lane, index) => (
            <BlueprintLaneCard
              cells={result.cells.filter((cell) => cell.laneKey === lane.key)}
              key={lane.key}
              lane={lane}
              number={index + 1}
            />
          ))}
        </div>
      </section>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BlueprintMeasurementContractCard
          contract={result.measurementContract}
        />
        <section className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="text-base font-bold text-text-primary">
            Source-asset gaps
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Constants can be reused across lanes, so the blueprint does not
            count the same source clip again just because it stays fixed.
          </p>
          <ul className="mt-4 grid gap-3">
            {result.assetGaps.map((gap) => (
              <BlueprintAssetGapCard gap={gap} key={gap.key} />
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-6">
        <BlueprintDecisionRubric rules={result.decisionRules} />
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This pattern-based blueprint uses only your assumptions. It is not a
        benchmark, forecast, performance prediction, persistent tracker, or ad
        platform integration, and it does not produce finished creative.
      </p>
    </div>}
      />
      <AppAdCreativeTestingBlueprintPricingCta variant={variant} />
    </Panel>
  );
}
