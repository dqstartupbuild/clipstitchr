import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function AppUgcClipPricingCta({
  variant,
}: {
  variant: PublicToolGateVariant;
}) {
  return (
    <aside className="rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="font-bold text-text-primary">
        Ready to reuse the clean source?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        A paid ClipStitchr plan organizes and normalizes clips, pairs UGC with
        app demos, and produces finished batches.
      </p>
      <PublicToolPaidCtaLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App UGC clip readiness checker"
        contentId="app_ugc_clip_readiness_checker_pricing"
        contentName="See ClipStitchr plans"
        toolKey="app-ugc-clip-readiness-checker"
        variant={variant}
      >
        See ClipStitchr plans <ArrowRight aria-hidden className="h-4 w-4" />
      </PublicToolPaidCtaLink>
    </aside>
  );
}
