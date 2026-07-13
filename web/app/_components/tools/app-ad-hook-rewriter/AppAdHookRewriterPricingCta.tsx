import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AppAdHookRewriterPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to turn a rewrite into a finished ad?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr helps app founders pair short hooks with UGC openings and
        real product demos.
      </p>
      <TrackedButtonLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad hook rewriter"
        contentId="app_ad_hook_rewriter_pricing"
        contentName="See ClipStitchr plans"
        href="/pricing"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
