import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import { HookVisualMatchmakerPricingCta } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerPricingCta";
import { HookVisualStoryboard } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualStoryboard";
import type { HookVisualMatchResult } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchResult";
import { formatHookVisualPlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/formatHookVisualPlan";
import { getHookVisualOpeningSourceLabel } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/getHookVisualOpeningSourceLabel";
import { getPublicHookIntentLabel } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookIntentLabel";

type HookVisualMatchmakerResultsProps = {
  result: HookVisualMatchResult;
};

export function HookVisualMatchmakerResults({
  result,
}: HookVisualMatchmakerResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-atomic="true" aria-live="polite">
        A primary five-second storyboard and alternate opening are ready.
      </p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="marketing-eyebrow">Primary match</p>
          <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
            {getPublicHookIntentLabel(result.intent)} → {getHookVisualOpeningSourceLabel(result.primary.openingSource)}
          </h2>
        </div>
        <CopyTextButton
          label="Copy visual plan"
          text={formatHookVisualPlan(result.primary)}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {result.explanation} This is a fit check, not a performance prediction.
      </p>
      {result.claimNotice ? (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          {result.claimNotice}
        </p>
      ) : null}
      <div className="mt-5 rounded-lg border border-border bg-surface-muted p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">
          On-screen text
        </p>
        <p className="mt-2 text-lg font-bold leading-7 text-text-primary">
          {result.primary.onScreenText}
        </p>
      </div>
      <HookVisualStoryboard beats={result.primary.storyboard} />
      <section className="mt-6 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-text-primary">
            Alternate opening: {getHookVisualOpeningSourceLabel(result.alternate.openingSource)}
          </h2>
          <CopyTextButton
            label="Copy alternate"
            text={formatHookVisualPlan(result.alternate)}
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {result.alternate.openingShot}
        </p>
      </section>
      <HookVisualMatchmakerPricingCta />
    </Panel>
  );
}
