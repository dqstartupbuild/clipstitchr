import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

type ResourcePricingCtaProps = {
  toolKey: PublicToolKey;
  variant: PublicToolGateVariant;
};

const linkClassName =
  "public-primary-action inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-accent px-5 text-sm font-bold text-text-inverse transition-colors hover:bg-accent-light";

export function ResourcePricingCta({
  toolKey,
  variant,
}: ResourcePricingCtaProps) {
  const contents = (
    <>
      See paid plans
      <ArrowRight aria-hidden className="h-4 w-4" />
    </>
  );

  return (
    <section className="public-tool-pricing-cta">
      <div>
        <div>
          <p>Ready to make the ads?</p>
          <h2>
            Keep planning free. Use ClipStitchr when it is time to produce.
          </h2>
          <p>
            ClipStitchr is paid software for organizing reusable footage and
            turning it into finished short-form ads.
          </p>
        </div>
        <PublicToolPaidCtaLink
          className={linkClassName}
          contentCategory="Public tool resource"
          contentId={`${toolKey}_pricing`}
          contentName="See paid plans"
          toolKey={toolKey}
          variant={variant}
        >
          {contents}
        </PublicToolPaidCtaLink>
      </div>
    </section>
  );
}
