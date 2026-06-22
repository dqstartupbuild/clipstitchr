import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

export function PricingHero() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            ClipStitchr pricing
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-text-primary md:text-6xl">
            Create more ad variants from the clips you already have.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Stitchr batches, scoring, templates, and your clip library are
            included. Use helper credits only when you want ClipStitchr to
            create new videos, visuals, or draft content for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButtonLink href="/sign-up" icon={<ArrowRight aria-hidden className="h-4 w-4" />}>
              Join the waitlist
            </PrimaryButtonLink>
            <SecondaryButtonLink href="/case-studies">
              See case studies
            </SecondaryButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
