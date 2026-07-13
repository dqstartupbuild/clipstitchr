import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AppUgcBriefPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to turn the delivered footage into reusable app ads?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Keep the separate UGC clips in ClipStitchr, pair them with a product
        demo, and build the next paid production batch without starting over.
      </p>
      <TrackedButtonLink
        href="/pricing"
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App UGC brief builder"
        contentId="app_ugc_brief_builder_pricing"
        contentName="See ClipStitchr plans"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
