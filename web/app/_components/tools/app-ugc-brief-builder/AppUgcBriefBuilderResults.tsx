import { AppUgcBriefPricingCta } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefPricingCta";
import { AppUgcBriefShotCard } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefShotCard";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppUgcBriefResult } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefResult";
import { formatAppUgcBriefText } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/formatAppUgcBriefText";

type AppUgcBriefBuilderResultsProps = {
  result: AppUgcBriefResult;
};

export function AppUgcBriefBuilderResults({
  result,
}: AppUgcBriefBuilderResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Brief updated with {result.deliverables.totalClips} separate source
        clips.
      </p>
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            Copyable creator brief
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {result.appName} UGC direction
          </h2>
        </div>
        <CopyTextButton
          className="shrink-0"
          label="Copy full brief"
          copiedLabel="Brief copied"
          text={formatAppUgcBriefText(result)}
        />
      </div>
      <div className="mt-5 grid gap-5">
        <section>
          <h3 className="text-sm font-bold text-text-primary">Objective</h3>
          <p className="mt-2 leading-7 text-text-secondary">
            {result.objective}
          </p>
        </section>
        <section>
          <h3 className="text-sm font-bold text-text-primary">
            Creator direction
          </h3>
          <p className="mt-2 leading-7 text-text-secondary">
            {result.creatorDirection}
          </p>
        </section>
        <section>
          <h3 className="text-sm font-bold text-text-primary">
            Three hook directions
          </h3>
          <ol className="mt-3 grid gap-3">
            {result.hookDirections.map((direction, index) => (
              <li
                className="rounded-lg border border-border bg-surface-muted/45 p-4 text-sm leading-6 text-text-secondary"
                key={direction}
              >
                <span className="mr-2 font-bold text-accent-dark">
                  {index + 1}.
                </span>
                {direction}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h3 className="text-sm font-bold text-text-primary">
            Shot list — {result.deliverables.totalClips} separate files
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.shotList.map((shot) => (
              <AppUgcBriefShotCard key={shot.title} shot={shot} />
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-bold text-text-primary">
            Product-demo handoff
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {result.productDemoHandoff}
          </p>
        </section>
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-900">Proof boundary</h3>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            {result.proofBoundary}
          </p>
        </section>
        <section>
          <h3 className="text-sm font-bold text-text-primary">
            Filming checklist
          </h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
            {result.filmingChecklist.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      </div>
      <AppUgcBriefPricingCta />
    </Panel>
  );
}
