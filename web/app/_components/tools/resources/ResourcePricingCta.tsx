import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

type ResourcePricingCtaProps = {
  toolKey: PublicToolKey;
  variant: PublicToolGateVariant;
};

const linkClassName =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-dark";

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
    <section className="px-6 pb-20 md:pb-24">
      <div className="marketing-card mx-auto flex max-w-4xl flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-accent-dark">
            Ready to make the ads?
          </p>
          <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
            Keep planning free. Use ClipStitchr when it is time to produce.
          </h2>
          <p className="mt-3 leading-7 text-text-secondary">
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
