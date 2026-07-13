import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function ProductDemoReadinessPricingCta() {
  return (
    <aside className="rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to put this demo behind more openings?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr’s paid workflow pairs one selected product demo with hooks,
        UGC clips, and shared text so you can make a focused batch.
      </p>
      <TrackedButtonLink
        href="/pricing"
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="Product demo readiness checker"
        contentId="product_demo_readiness_checker_pricing"
        contentName="See ClipStitchr plans"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
