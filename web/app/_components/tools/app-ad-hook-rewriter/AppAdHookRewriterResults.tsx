import Link from "next/link";
import { AppAdHookRewriteCard } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriteCard";
import { AppAdHookRewriterPricingCta } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterPricingCta";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdHookRewriterResult } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterResult";
import { getPublicHookIntentLabel } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookIntentLabel";

type AppAdHookRewriterResultsProps = {
  result: AppAdHookRewriterResult;
};

export function AppAdHookRewriterResults({
  result,
}: AppAdHookRewriterResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="sr-only" aria-atomic="true" aria-live="polite">
        Six hook rewrites are ready.
      </p>
      <p className="marketing-eyebrow">Your rewrite set</p>
      <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
        Six different jobs for the same app idea.
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Detected starting intent: {getPublicHookIntentLabel(result.detectedIntent)}.
        Each version uses a fresh structure rather than a light paraphrase.
      </p>
      {result.claimSignals.length ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="font-bold">Proof reminder</p>
          <p>
            The submitted context included wording that may need support. The
            rewrites use safer alternatives, but every final claim still needs
            human review.
          </p>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4">
        {result.rewrites.map((rewrite, index) => (
          <AppAdHookRewriteCard
            index={index}
            key={rewrite.direction}
            rewrite={rewrite}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-5 text-sm font-bold">
        <Link className="text-accent-dark underline underline-offset-4" href="/tools/app-ad-hook-grader">
          Grade another hook
        </Link>
        <Link className="text-accent-dark underline underline-offset-4" href="/tools/hook-to-visual-matchmaker">
          Match a hook to a visual
        </Link>
      </div>
      <AppAdHookRewriterPricingCta />
    </Panel>
  );
}
