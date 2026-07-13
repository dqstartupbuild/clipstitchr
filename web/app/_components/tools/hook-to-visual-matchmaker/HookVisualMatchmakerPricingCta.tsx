import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function HookVisualMatchmakerPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to pair the opening with your app demo?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr turns UGC openings and product demos into short-form ad
        variations inside a paid creative workflow.
      </p>
      <TrackedButtonLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="Hook to visual matchmaker"
        contentId="hook_to_visual_matchmaker_pricing"
        contentName="See ClipStitchr plans"
        href="/pricing"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
