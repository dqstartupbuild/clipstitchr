import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AppAdHookGraderPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to test the hook in a finished ad?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr pairs openings with product demos so app founders can turn
        a promising line into short-form ads.
      </p>
      <TrackedButtonLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad hook grader"
        contentId="app_ad_hook_grader_pricing"
        contentName="See ClipStitchr plans"
        href="/pricing"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
