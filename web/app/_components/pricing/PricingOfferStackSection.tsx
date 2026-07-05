import { CheckCircle2 } from "lucide-react";
import { pricingOfferItems } from "@/lib/clipstitchr/pricing/pricingOfferItems";

export function PricingOfferStackSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="marketing-eyebrow">
              What you get
            </p>
            <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
              The parts of content work you keep putting off, bundled together.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pricingOfferItems.map((item) => (
              <div
                className="marketing-card flex items-start gap-3 p-4"
                key={item}
              >
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                />
                <p className="text-sm font-semibold leading-6 text-text-primary">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
