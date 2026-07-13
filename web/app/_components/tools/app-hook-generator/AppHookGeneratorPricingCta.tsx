import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AppHookGeneratorPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to turn the hook into a finished ad?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr helps app founders pair strong openings with product demos
        and turn the combinations into short-form ads.
      </p>
      <TrackedButtonLink
        href="/pricing"
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App hook generator"
        contentId="app_hook_generator_pricing"
        contentName="See ClipStitchr plans"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
