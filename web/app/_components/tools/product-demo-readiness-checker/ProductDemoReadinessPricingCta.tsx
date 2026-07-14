import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function ProductDemoReadinessPricingCta({
  variant,
}: {
  variant: PublicToolGateVariant;
}) {
  return (
    <aside className="rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to put this demo behind more openings?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr’s paid workflow pairs one selected product demo with hooks,
        UGC clips, and shared text so you can make a focused batch.
      </p>
      <PublicToolPaidCtaLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="Product demo readiness checker"
        contentId="product_demo_readiness_checker_pricing"
        contentName="See ClipStitchr plans"
        toolKey="product-demo-readiness-checker"
        variant={variant}
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </PublicToolPaidCtaLink>
    </aside>
  );
}
