import { CheckCircle2 } from "lucide-react";
import { pricingOfferItems } from "@/lib/clipstitchr/pricing/pricingOfferItems";

export function PricingOfferStackSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              What you get
            </p>
            <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
              The parts of content work you keep putting off, bundled together.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pricingOfferItems.map((item) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
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
