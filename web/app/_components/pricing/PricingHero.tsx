import { ArrowRight } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

export function PricingHero() {
  return (
    <section className="marketing-grid-bg border-b border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="marketing-eyebrow">ClipStitchr pricing</p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Simple pricing for content that stops eating your week.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Stitchr, scoring, Hook Lab Ideas, and your clip library are
            included. Credits only matter when ClipStitchr creates extra videos,
            visuals, or drafts because your library is thin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButtonLink
              href="#plans"
              icon={<ArrowRight aria-hidden className="h-4 w-4" />}
            >
              Choose a plan
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
