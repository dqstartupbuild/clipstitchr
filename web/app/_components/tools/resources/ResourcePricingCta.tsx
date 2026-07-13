import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ResourcePricingCta() {
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
        <Link
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-dark"
          href="/pricing"
        >
          See paid plans
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
