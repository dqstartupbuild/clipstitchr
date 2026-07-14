import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function NineBySixteenVideoCheckerPricingCta({
  variant,
}: {
  variant: PublicToolGateVariant;
}) {
  return (
    <aside className="rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to turn the demo into finished ad variations?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr prepares source clips for a vertical canvas, then pairs
        app demos with hooks and UGC in its paid production workflow.
      </p>
      <PublicToolPaidCtaLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="9:16 app demo video checker"
        contentId="nine_by_sixteen_video_checker_pricing"
        contentName="See ClipStitchr plans"
        toolKey="9-16-app-demo-video-checker"
        variant={variant}
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </PublicToolPaidCtaLink>
    </aside>
  );
}
