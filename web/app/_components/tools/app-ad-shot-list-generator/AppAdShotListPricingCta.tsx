import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AppAdShotListPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="font-bold text-text-primary">
        Captured the list? Put those clips to work.
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr keeps your source footage organized, pairs reusable UGC with
        product demos, and produces finished batches on a paid plan.
      </p>
      <TrackedButtonLink
        href="/pricing"
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad shot list generator"
        contentId="app_ad_shot_list_generator_pricing"
        contentName="See ClipStitchr plans"
      >
        See ClipStitchr plans <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
