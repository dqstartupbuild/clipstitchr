import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { Button } from "@/app/_components/ui/Button";
import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { HookLabProductAdaptationController } from "@/lib/clipstitchr/types/HookLabProductAdaptationController";

export function HookLabQuickRead({
  adaptation,
  analysis,
  onGenerate,
  onOpenScript,
}: {
  adaptation: HookLabProductAdaptationController;
  analysis: HookLabPostAnalysis;
  onGenerate: () => void;
  onOpenScript: () => void;
}) {
  const formatDna = analysis.formatDna;
  const keep = analysis.recreationEssentials?.length
    ? analysis.recreationEssentials
    : formatDna
      ? [formatDna.signatureDevice, formatDna.retentionDevice]
      : [analysis.openingHook];
  const leaveBehind = [
    ...(analysis.copyabilityWarnings ?? []),
    ...(formatDna?.doNotCopy ?? []),
  ];

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8">
      <section aria-labelledby="hook-lab-quick-summary">
        <h3
          className="text-balance text-2xl font-bold text-text-primary"
          id="hook-lab-quick-summary"
        >
          What happens
        </h3>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-7 text-text-secondary">
          {analysis.contentSummary}
        </p>
      </section>

      <section aria-labelledby="hook-lab-quick-hook">
        <h3
          className="text-balance text-lg font-bold text-text-primary"
          id="hook-lab-quick-hook"
        >
          The hook at a glance
        </h3>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold text-text-primary">
              First frame
            </dt>
            <dd className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {formatDna?.openingVisual ?? analysis.openingHook}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-text-primary">
              Open question
            </dt>
            <dd className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {formatDna?.openingQuestion ?? analysis.format}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-text-primary">
              First payoff
            </dt>
            <dd className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {formatDna?.firstPayoff ?? analysis.callToAction}
              {formatDna?.firstPayoffAtSeconds === undefined
                ? ""
                : ` Around ${formatDna.firstPayoffAtSeconds.toFixed(1)}s.`}
            </dd>
          </div>
        </dl>
      </section>

      {formatDna ? (
        <section
          aria-labelledby="hook-lab-quick-recipe"
          className="rounded-lg bg-surface-muted p-5 sm:p-6"
        >
          <h3
            className="text-balance text-lg font-bold text-text-primary"
            id="hook-lab-quick-recipe"
          >
            The format recipe
          </h3>
          <p className="mt-3 text-pretty text-base leading-7 text-text-primary">
            {formatDna.replicationFormula}
          </p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {formatDna.storyBeats.map((beat, index) => (
              <li
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-2 text-sm leading-6 text-text-secondary"
                key={`${index}-${beat}`}
              >
                <span className="tabular-nums font-semibold text-accent-dark">
                  {index + 1}.
                </span>
                <span className="text-pretty">{beat}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="hook-lab-quick-decisions">
        <h3
          className="text-balance text-lg font-bold text-text-primary"
          id="hook-lab-quick-decisions"
        >
          What to keep and what to change
        </h3>
        <dl className="mt-4 grid gap-5 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold text-text-primary">Keep</dt>
            <dd className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {keep.join(" ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-text-primary">Adapt</dt>
            <dd className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              Keep each beat&apos;s purpose and pace. Replace the source&apos;s
              product behavior, actions, props, wording, and proof with new
              scenes based only on what your product really does.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-text-primary">
              Leave behind
            </dt>
            <dd className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {leaveBehind.length
                ? leaveBehind.join(" ")
                : "Do not copy creator-specific identity, footage, or mannerisms."}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="hook-lab-quick-action"
        className="rounded-lg bg-surface-muted p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6"
      >
        <div>
          <h3
            className="text-balance text-lg font-bold text-text-primary"
            id="hook-lab-quick-action"
          >
            {adaptation.isLoadingBrief
              ? "Checking for your saved script"
              : adaptation.brief
              ? "Your product script is ready"
              : "Turn this into your product script"}
          </h3>
          <p className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
            {adaptation.isLoadingBrief
              ? "Your previous work will appear here as soon as it is loaded."
              : adaptation.brief
              ? `Open the script created for ${adaptation.briefProductName ?? "your product"}.`
              : adaptation.activeProductIsUsable && adaptation.activeProduct
                ? `Create an original ${adaptation.activeProduct.name} ad from this format. Generation uses 1 creation credit.`
                : "Select an available product with the dashboard product picker first."}
          </p>
        </div>
        <Button
          className="mt-4 shrink-0 sm:mt-0"
          disabled={
            adaptation.isLoadingBrief ||
            (!adaptation.brief && !adaptation.activeProductIsUsable)
          }
          isLoading={adaptation.isGenerating || adaptation.isLoadingBrief}
          type="button"
          onClick={adaptation.brief ? onOpenScript : onGenerate}
        >
          {adaptation.brief ? "Open your script" : "Use this format"}
        </Button>
      </section>

      {adaptation.error ? (
        <DashboardAlert variant="error">{adaptation.error}</DashboardAlert>
      ) : null}
    </div>
  );
}
